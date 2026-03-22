import request from 'supertest';
import { app } from '../app.js';
import { HTTP_STATUSES } from '../shared/HTTP_STATUSES.js';
import {
  connectToDatabase,
  disconnectToDatabase,
  getDb,
} from '../shared/db/mongo.js';
import type { UserDbModel } from '../modules/user/infrastructure/types/user.db.model.js';
import type { NutritionDbModel } from '../modules/nutrition/infrastructure/types/nutrition.db.model.js';

type NutritionView = {
  date: string;
  calories: number;
  fats: number;
  carbs: number;
  protein: number;
};

let createdNutritions: NutritionView[] = [];
let foreignNutrition: NutritionView | null = null;
let accessToken = '';
let secondaryAccessToken = '';
const TEST_DB = 'life_nutrition_test';

const nutritionsToCreate = [
  {
    date: '2026-03-20',
    calories: 2200,
    fats: 70,
    carbs: 250,
    protein: 140,
  },
  {
    date: '2026-03-21',
    calories: 2100,
    fats: 60,
    carbs: 230,
    protein: 150,
  },
  {
    date: '2026-03-22',
    calories: 2400,
    fats: 80,
    carbs: 260,
    protein: 160,
  },
];

const incorrectedData = {
  date: '21-03-2026',
  calories: -10,
  fats: 'many',
  carbs: -30,
  protein: -5,
};

const authHeader = (token = accessToken) => ({
  Authorization: `Bearer ${token}`,
});

const createAndLoginUser = async (suffix: string): Promise<string> => {
  const user = {
    login: `n_${suffix}`,
    email: `n_${suffix}@mail.com`,
    password: '12345678',
  };

  await request(app)
    .post('/user/register')
    .send(user)
    .expect(HTTP_STATUSES.CREATED_201);

  const usersCol = getDb<UserDbModel>('user');
  const createdUser = await usersCol.findOne({ email: user.email });
  if (!createdUser?.confirmationCode) {
    throw new Error('confirmationCode not found');
  }

  await request(app)
    .get(`/user/verify?code=${createdUser.confirmationCode}`)
    .expect(HTTP_STATUSES.OK_200);

  const loginRes = await request(app)
    .post('/user/login')
    .send({ login: user.login, password: user.password })
    .expect(HTTP_STATUSES.OK_200);

  return loginRes.body.message.token;
};

beforeAll(async () => {
  await connectToDatabase(TEST_DB);

  const usersCol = getDb<UserDbModel>('user');
  const nutritionCol = getDb<NutritionDbModel>('nutrition');
  await usersCol.deleteMany({});
  await nutritionCol.deleteMany({});

  const suffix = Date.now().toString().slice(-6);
  accessToken = await createAndLoginUser(`${suffix}a`);
  secondaryAccessToken = await createAndLoginUser(`${suffix}b`);

  for (const nutrition of nutritionsToCreate) {
    const res = await request(app)
      .post('/nutrition')
      .set(authHeader())
      .send(nutrition)
      .expect(HTTP_STATUSES.CREATED_201);

    createdNutritions.push(res.body.message);
  }

  const foreignRes = await request(app)
    .post('/nutrition')
    .set(authHeader(secondaryAccessToken))
    .send({
      date: '2026-03-25',
      calories: 1900,
      fats: 55,
      carbs: 180,
      protein: 130,
    })
    .expect(HTTP_STATUSES.CREATED_201);

  foreignNutrition = foreignRes.body.message;
});

describe('/nutrition', () => {
  it('should return 200 and correct array of own nutritions', async () => {
    await request(app)
      .get('/nutrition')
      .set(authHeader())
      .expect(HTTP_STATUSES.OK_200, { message: createdNutritions });
  });

  it('should return 200 and nutrition by date', async () => {
    const date = createdNutritions[0]?.date;
    const res = await request(app)
      .get(`/nutrition/${date}`)
      .set(authHeader())
      .expect(HTTP_STATUSES.OK_200);

    expect(res.body.message).toEqual(
      createdNutritions.find((nutrition) => nutrition.date === date),
    );
  });

  it('should return 400 and message about invalid date parameter', async () => {
    await request(app)
      .get('/nutrition/20-03-2026')
      .set(authHeader())
      .expect(HTTP_STATUSES.BAD_REQUEST_400)
      .expect(({ body }) => {
        expect(body.message).toBe('Validation failed');
      });
  });

  it('should return 200 and correct array by query parameters', async () => {
    const data = { date: '2026-03-20' };
    const expected = createdNutritions.filter(
      (nutrition) => nutrition.date === data.date,
    );

    await request(app)
      .get('/nutrition')
      .set(authHeader())
      .query(data)
      .expect(HTTP_STATUSES.OK_200, { message: expected });
  });

  it('should return 201 and new nutrition day', async () => {
    const newNutrition = {
      date: '2026-03-23',
      calories: 2500,
      fats: 85,
      carbs: 270,
      protein: 170,
    };

    const res = await request(app)
      .post('/nutrition')
      .set(authHeader())
      .send(newNutrition)
      .expect(HTTP_STATUSES.CREATED_201);

    expect(res.body.message).toEqual(newNutrition);
  });

  it(`shouldn't create nutrition with invalid data`, async () => {
    await request(app)
      .post('/nutrition')
      .set(authHeader())
      .send(incorrectedData)
      .expect(HTTP_STATUSES.BAD_REQUEST_400)
      .expect(({ body }) => {
        expect(body.message).toBe('Validation failed');
      });
  });

  it(`shouldn't create nutrition with duplicate date`, async () => {
    await request(app)
      .post('/nutrition')
      .set(authHeader())
      .send(nutritionsToCreate[0])
      .expect(409, { message: 'Nutrition for this date already exists' });
  });

  it('should not expose foreign nutrition', async () => {
    await request(app)
      .get(`/nutrition/${foreignNutrition?.date}`)
      .set(authHeader())
      .expect(HTTP_STATUSES.NOT_FOUND_404, { message: 'Nutrition not found' });
  });

  it('should delete created item', async () => {
    const createRes = await request(app)
      .post('/nutrition')
      .set(authHeader())
      .send({
        date: '2026-03-24',
        calories: 2300,
        fats: 75,
        carbs: 240,
        protein: 150,
      })
      .expect(HTTP_STATUSES.CREATED_201);

    const date = createRes.body.message.date;

    await request(app)
      .delete(`/nutrition/${date}`)
      .set(authHeader())
      .expect(HTTP_STATUSES.OK_200);
  });

  it('shouldn`t delete item with unexpected date', async () => {
    await request(app)
      .delete('/nutrition/2026-03-31')
      .set(authHeader())
      .expect(HTTP_STATUSES.NOT_FOUND_404, { message: 'Nutrition not found' });
  });

  it('shouldn`t delete item with invalid date format', async () => {
    await request(app)
      .delete('/nutrition/31-03-2026')
      .set(authHeader())
      .expect(HTTP_STATUSES.BAD_REQUEST_400)
      .expect(({ body }) => {
        expect(body.message).toBe('Validation failed');
      });
  });

  it(`should update nutrition with correct data`, async () => {
    let res = await request(app)
      .put(`/nutrition/${createdNutritions[0]?.date}`)
      .set(authHeader())
      .send({ calories: 2600 })
      .expect(HTTP_STATUSES.OK_200);

    const updatedNutrition = res.body.message;
    expect(updatedNutrition.calories).toBe(2600);
    expect(updatedNutrition.date).toBe(createdNutritions[0]?.date);
  });

  it(`shouldn't update nutrition with unexpected date and return 404`, async () => {
    await request(app)
      .put('/nutrition/2026-04-01')
      .set(authHeader())
      .send({
        calories: 3000,
      })
      .expect(HTTP_STATUSES.NOT_FOUND_404, { message: 'Nutrition not found' });
  });

  it(`shouldn't update nutrition with invalid date format and return 400`, async () => {
    await request(app)
      .put('/nutrition/01-04-2026')
      .set(authHeader())
      .send({
        calories: 3000,
      })
      .expect(HTTP_STATUSES.BAD_REQUEST_400)
      .expect(({ body }) => {
        expect(body.message).toBe('Validation failed');
      });
  });

  it(`shouldn't update nutrition with incorrected data`, async () => {
    await request(app)
      .put(`/nutrition/${createdNutritions[0]?.date}`)
      .set(authHeader())
      .send(incorrectedData)
      .expect(HTTP_STATUSES.BAD_REQUEST_400)
      .expect(({ body }) => {
        expect(body.message).toBe('Validation failed');
      });
  });
});

afterAll(async () => {
  await disconnectToDatabase();
});
