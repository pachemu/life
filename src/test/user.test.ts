import { app } from '../app.js';
import request from 'supertest';
import { connectToDatabase } from '../shared/db/mongo.js';

type users = {
  id: string;
};

beforeAll(async () => {
  await connectToDatabase('life');
  const users = await request(app).get('/users');
  for (let user in users) {
    // мб нужно написать не body а чет другое
    // let id = user.id;
    await request(app).delete(`/user/${user}`);
  }
});
