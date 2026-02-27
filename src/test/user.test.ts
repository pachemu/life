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
    password: 'Arthur genius',
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
});
