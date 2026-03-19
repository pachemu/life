import request from 'supertest';
import { app } from '../app.js';
import { HTTP_STATUSES } from '../shared/HTTP_STATUSES.js';
import type { BookDb, GetBookData } from '../shared/db/types.js';
import {
  connectToDatabase,
  disconnectToDatabase,
  getDb,
} from '../shared/db/mongo.js';
import type { UserDbModel } from '../modules/user/infrastructure/types/user.db.model.js';

let createdBooks: BookDb[] = [];
let foreignBook: BookDb | null = null;
let accessToken = '';
let secondaryAccessToken = '';
const TEST_DB = 'life_books_test';

const booksToCreate = [
  { title: 'Замок', author: 'Кафка', readPages: 480, totalPages: 480 },
  {
    title: 'Человек без свойств',
    author: 'Музиль',
    readPages: 0,
    totalPages: 900,
  },
  {
    title: 'Замок тьмы',
    author: 'Татьяна Дивергент',
    readPages: 0,
    totalPages: 200,
  },
];

const incorrectedData = {
  title: '',
  author: 'R',
  readPages: 'Нет ещё',
  totalPages: 0,
};

const authHeader = (token = accessToken) => ({
  Authorization: `Bearer ${token}`,
});

const createAndLoginUser = async (suffix: string): Promise<string> => {
  const user = {
    login: `books_${suffix}`,
    email: `books_${suffix}@mail.com`,
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

  const suffix = Date.now().toString();
  accessToken = await createAndLoginUser(`${suffix}_main`);
  secondaryAccessToken = await createAndLoginUser(`${suffix}_secondary`);

  await request(app)
    .delete('/books')
    .set(authHeader())
    .expect(HTTP_STATUSES.OK_200);

  await request(app)
    .delete('/books')
    .set(authHeader(secondaryAccessToken))
    .expect(HTTP_STATUSES.OK_200);

  for (const book of booksToCreate) {
    const res = await request(app)
      .post('/books')
      .set(authHeader())
      .send(book)
      .expect(HTTP_STATUSES.CREATED_201);

    createdBooks.push(res.body.message);
  }

  const foreignRes = await request(app)
    .post('/books')
    .set(authHeader(secondaryAccessToken))
    .send({
      title: 'Чужая книга',
      author: 'Другой пользователь',
      readPages: 10,
      totalPages: 100,
    })
    .expect(HTTP_STATUSES.CREATED_201);

  foreignBook = foreignRes.body.message;
});

describe('/books', () => {
  it('should return 200 and correct array of own books', async () => {
    await request(app)
      .get('/books')
      .set(authHeader())
      .expect(HTTP_STATUSES.OK_200, { message: createdBooks });
  });
  it('should return 200 and good array by id parametres', async () => {
    const id = createdBooks[0]?.id;
    const res = await request(app)
      .get(`/books/${id}`)
      .set(authHeader())
      .expect(HTTP_STATUSES.OK_200);

    expect(res.body.message).toEqual(
      createdBooks.find((book) => book.id === id),
    );
  });
  it('should return 400 and message about invalid id parameters', async () => {
    const id = createdBooks[0]?.id.slice(1);
    await request(app)
      .get(`/books/${id}`)
      .set(authHeader())
      .expect(HTTP_STATUSES.BAD_REQUEST_400)
      .expect(({ body }) => {
        expect(body.message).toBe('Validation failed');
      });
  });

  it('should return 200 and good array by query parameters', async () => {
    const data: GetBookData = { title: 'замок' };

    const expected = createdBooks.filter((d: { title: string | string[] }) =>
      d.title.toString().toLowerCase().includes('замок'),
    );

    await request(app)
      .get('/books')
      .set(authHeader())
      .query(data)
      .expect(HTTP_STATUSES.OK_200, { message: expected });
  });

  it('should return 201 and new book', async () => {
    const res = await request(app)
      .post('/books')
      .set(authHeader())
      .send(booksToCreate[0])
      .expect(HTTP_STATUSES.CREATED_201);

    expect(res.body.message).toEqual({
      ...booksToCreate[0],
      id: res.body.message.id,
    });
  });

  it(`shouldn't create book with invalid data`, async () => {
    await request(app)
      .post('/books')
      .set(authHeader())
      .send(incorrectedData)
      .expect(HTTP_STATUSES.BAD_REQUEST_400)
      .expect(({ body }) => {
        expect(body.message).toBe('Validation failed');
      });
  });

  it('should not expose foreign books', async () => {
    await request(app)
      .get(`/books/${foreignBook?.id}`)
      .set(authHeader())
      .expect(HTTP_STATUSES.NOT_FOUND_404, { message: 'Book not found' });
  });

  it('should delete created item', async () => {
    const createRes = await request(app)
      .post('/books')
      .set(authHeader())
      .send({ ...booksToCreate[1] })
      .expect(HTTP_STATUSES.CREATED_201);

    const id = createRes.body.message.id;

    await request(app)
      .delete(`/books/${id}`)
      .set(authHeader())
      .expect(HTTP_STATUSES.OK_200);
  });

  it('shouldn`t delete item with unexpected id', async () => {
    const id = '00000020f51bb4362eee2a4d';
    await request(app)
      .delete(`/books/${id}`)
      .set(authHeader())
      .expect(HTTP_STATUSES.NOT_FOUND_404, { message: 'Book not found' });
  });

  it('shouldn`t delete item with invalid id format', async () => {
    const id = createdBooks[0]?.id.slice(1);
    await request(app)
      .delete(`/books/${id}`)
      .set(authHeader())
      .expect(HTTP_STATUSES.BAD_REQUEST_400)
      .expect(({ body }) => {
        expect(body.message).toBe('Validation failed');
      });
  });

  it(`should update book with correct data`, async () => {
    let res = await request(app)
      .put(`/books/${createdBooks[0]?.id}`)
      .set(authHeader())
      .send({ title: 'Война и пиво' })
      .expect(HTTP_STATUSES.OK_200);

    const updatedDirection = res.body.message;
    expect(updatedDirection.title).toBe('Война и пиво');
    expect(updatedDirection.id).toBe(createdBooks[0]?.id);
  });

  it(`shouldn't update book with unexpected id and return 404`, async () => {
    const id = '00000020f51bb4362eee2a4d';
    await request(app)
      .put(`/books/${id}`)
      .set(authHeader())
      .send({
        title: 'НЕ ДОЛЖНО БЫТЬ',
      })
      .expect(HTTP_STATUSES.NOT_FOUND_404, { message: 'Book not found' });
  });

  it(`shouldn't update book with invalid id format and return 400`, async () => {
    const id = createdBooks[0]?.id.slice(1);
    await request(app)
      .put(`/books/${id}`)
      .set(authHeader())
      .send({
        title: 'НЕ ДОЛЖНО БЫТЬ',
      })
      .expect(HTTP_STATUSES.BAD_REQUEST_400)
      .expect(({ body }) => {
        expect(body.message).toBe('Validation failed');
      });
  });

  it(`shouldn't update book with incorrected data`, async () => {
    await request(app)
      .put(`/books/${createdBooks[0]?.id}`)
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
