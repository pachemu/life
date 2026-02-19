import { getDb } from '../../../shared/db/mongo.js';
import type {
  CreateUserInput,
  LoginUserInput,
} from '../domain/user.repository.js';
import * as bcrypt from 'bcrypt';

const USER_COLLECTION = 'user';
const getUserCollection = () => getDb<any>(USER_COLLECTION);

const createUser = async (userData: CreateUserInput): Promise<string> => {
  const collection = getUserCollection();
  type UserData = {
    date: string;
    password: string;
    login: string;
    email: string;
  };

  const salt = await bcrypt.genSalt(10);
  const password = await bcrypt.hash(userData.password, salt);

  const user: UserData = {
    date: new Date().toString(),
    password: password,
    login: userData.login,
    email: userData.email,
  };
  let result = await collection.insertOne(user);

  return `${result.acknowledged}`;
};

const loginUser = async (userData: LoginUserInput): Promise<string> => {
  const collection = getUserCollection();
  let user = await collection.findOne({
    login: { $regex: userData.login, $options: 'i' },
  });
  if (!user) return 'user not found';
  console.log(userData.password, user.password);
  const match = await bcrypt.compare(userData.password, user.password);
  console.log('match', match);
  return match ? 'successfull' : 'not a correct password';
};

export const UserRepositoryMongo = {
  createUser,
  loginUser,
};
