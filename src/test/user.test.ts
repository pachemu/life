import { app } from '../app.js';
import request from 'supertest';
import { connectToDatabase } from '../shared/db/mongo.js';
import { HTTP_STATUSES } from '../shared/HTTP_STATUSES.js';

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
});

describe('/user', () => {
  it('should return 200 and correct array of users', async () => {
    await request(app)
      .get('/user/users')
      .expect(HTTP_STATUSES.OK_200, { message: users });
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
  it('should return 200 and tokenId', async () => {
    const res = await request(app)
      .post('/user/login')
      .send({
        login: exampleUsers[0]?.login,
        password: exampleUsers[0]?.password,
      })
      .expect(HTTP_STATUSES.OK_200);
    expect(res.body.message).toEqual(expect.any(String));
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
