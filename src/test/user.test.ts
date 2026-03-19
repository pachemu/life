import { app } from '../app.js';
import request from 'supertest';
import {
  connectToDatabase,
  disconnectToDatabase,
  getDb,
} from '../shared/db/mongo.js';
import { HTTP_STATUSES } from '../shared/HTTP_STATUSES.js';
import type { UserDbModel } from '../modules/user/infrastructure/types/user.db.model.js';
import type TestAgent from 'supertest/lib/agent.js';
import type { Collection } from 'mongodb';

type UserDb = {
  userId: string;
  email: string;
  login: string;
};

type User = {
  login: string;
  email: string;
  password: string;
};

let users: UserDb[] = [];

let exampleUsers: User[] = [
  {
    login: 'Volodya',
    email: 'ZALUPA1488@gmail.com',
    password: '987456321',
  },
  {
    login: 'Mellstroy',
    email: 'kazinoDep12@gmail.com',
    password: 'ArthurGenius',
  },
];

let incorrectedUsers: User[] = [
  {
    login: 'A',
    email: 'ZALUPA1488.',
    password: '987456321',
  },
  {
    login: 'Lay',
    email: 'kazinoDep1mail.com',
    password: 'Aeius',
  },
];
let usersCol: Collection<UserDbModel>;
let created;
let code: string | undefined;
let agent: TestAgent;
beforeAll(async () => {
  await connectToDatabase('life');
  let foundUsers: UserDb[] = (await request(app).get('/user/users')).body
    .message;

  for (const user of foundUsers) {
    await request(app).delete(`/user/delete/${user.userId}`);
  }

  for (const user of exampleUsers) {
    const response = await request(app).post('/user/register').send(user);
    users.push(response.body.message);
  }
  usersCol = getDb<UserDbModel>('user');
  created = await usersCol.findOne({ email: exampleUsers[0]!.email });
  if (!created?.confirmationCode) {
    throw new Error('confirmationCode not found for seeded user');
  }
  code = created.confirmationCode;
  agent = request.agent(app);
});

describe('/user', () => {
  it('should return 200 and correct array of users', async () => {
    await request(app)
      .get('/user/users')
      .expect(HTTP_STATUSES.OK_200, { message: users });
  });
  it('should not leak private fields in users list', async () => {
    const res = await request(app)
      .get('/user/users')
      .expect(HTTP_STATUSES.OK_200);
    const first = res.body.message[0];
    expect(first.confirmationCode).toBeUndefined();
    expect(first.expirationCodeTime).toBeUndefined();
    expect(first.refreshTokenHash).toBeUndefined();
  });
  it('should return 201 and created user', async () => {
    const response = await request(app)
      .post('/user/register')
      .send(exampleUsers[0])
      .expect(HTTP_STATUSES.CREATED_201);
    expect(response.body.message).toEqual(
      expect.objectContaining({
        email: exampleUsers[0]?.email,
        login: exampleUsers[0]?.login,
        userId: expect.any(String),
      }),
    );
  });
  it('should return 400 and message validation failed', async () => {
    const response = await request(app)
      .post('/user/register')
      .send(incorrectedUsers[0])
      .expect(HTTP_STATUSES.BAD_REQUEST_400);
    expect(response.body.message).toEqual('Validation failed');
  });
  it('should return 401 unathorized', async () => {
    await request(app)
      .post('/user/login')
      .send({
        login: exampleUsers[0]?.login,
        password: exampleUsers[0]?.password,
      })
      .expect(HTTP_STATUSES.UNATHORIZED_401);
  });
  it('should return 401 and unathorized', async () => {
    const res = await request(app)
      .post('/user/login')
      .send({
        login: exampleUsers[0]?.login,
        password: exampleUsers[1]?.password,
      })
      .expect(HTTP_STATUSES.UNATHORIZED_401);
    expect(res.body.message).toEqual('Unathorized');
  });
  it('should return 200 and athorized', async () => {
    const res = await request(app)
      .get(`/user/verify?code=${code}`)
      .expect(HTTP_STATUSES.OK_200);
    expect(res.body.message).toEqual(true);
  });
  it('should return 400 and invalid code', async () => {
    const res = await request(app)
      .get(`/user/verify?code=sdadweasds`)
      .expect(HTTP_STATUSES.BAD_REQUEST_400);
    expect(res.body.message).toEqual('Validation failed');
  });
  it('should return 400 and invalid or expired code', async () => {
    const res = await request(app)
      .get('/user/verify?code=123e4567-e89b-12d3-a456-426614174000')
      .expect(HTTP_STATUSES.BAD_REQUEST_400);

    expect(res.body.message).toEqual('Invalid or expired code');
  });

  it('should return 400 when code is missing', async () => {
    await request(app)
      .get('/user/verify')
      .expect(HTTP_STATUSES.BAD_REQUEST_400);
  });
  it('should return 200 and token', async () => {
    const res = await agent
      .post('/user/login')
      .send({
        login: exampleUsers[0]?.login,
        password: exampleUsers[0]?.password,
      })
      .expect(HTTP_STATUSES.OK_200);

    expect(res.body.message.token).toEqual(expect.any(String));
  });

  it('should return 400 and validation failed', async () => {
    const res = await request(app)
      .post('/user/login')
      .send({
        login: incorrectedUsers[0]?.login,
        password: incorrectedUsers[1]?.password,
      })
      .expect(HTTP_STATUSES.BAD_REQUEST_400);
    expect(res.body.message).toEqual('Validation failed');
  });

  it('should return 401 and not found cookie', async () => {
    const response = await request(app)
      .post(`/user/refresh`)
      .set('Cookie', `refreshToken=UNEXPECTED;`)
      .expect(HTTP_STATUSES.UNATHORIZED_401);
    expect(response.body.message).toEqual('invalid refresh token');
  });
  it('should return 401 when refresh cookie is missing', async () => {
    await request(app)
      .post('/user/refresh')
      .expect(HTTP_STATUSES.UNATHORIZED_401);
  });
  it('should return 200 and new pair of tokens', async () => {
    await agent
      .post('/user/login')
      .send({
        login: exampleUsers[0]?.login,
        password: exampleUsers[0]?.password,
      })
      .expect(HTTP_STATUSES.OK_200);

    const res = await agent.post('/user/refresh').expect(HTTP_STATUSES.OK_200);

    expect(res.body.message).toEqual(expect.any(String));
  });
  it('logout should invalidate refresh token', async () => {
    const localAgent = request.agent(app);
    const unique = Date.now();
    const user = {
      login: `logout_user_${unique}`,
      email: `logout_user_${unique}@mail.com`,
      password: '12345678',
    };
    await localAgent.post('/user/register').send(user).expect(201);

    const createdLocal = await usersCol.findOne({ email: user.email });
    if (!createdLocal?.confirmationCode) {
      throw new Error('confirmationCode not found for logout user');
    }
    await localAgent
      .get(`/user/verify?code=${createdLocal.confirmationCode}`)
      .expect(HTTP_STATUSES.OK_200);

    await localAgent
      .post('/user/login')
      .send({ login: user.login, password: user.password })
      .expect(HTTP_STATUSES.OK_200);

    await localAgent.post('/user/logout').expect(HTTP_STATUSES.OK_200);
    await localAgent
      .post('/user/refresh')
      .expect(HTTP_STATUSES.UNATHORIZED_401);
  });
  it('should return 200 and delete user', async () => {
    await request(app)
      .delete(`/user/delete/${users[0]?.userId}`)
      .expect(HTTP_STATUSES.OK_200, { message: true });
  });
  it('should return 400 and validation failed', async () => {
    const response = await request(app)
      .delete(`/user/delete/$123`)
      .expect(HTTP_STATUSES.BAD_REQUEST_400);
    expect(response.body.message).toEqual('Validation failed');
  });
});

afterAll(async () => {
  await disconnectToDatabase();
});
