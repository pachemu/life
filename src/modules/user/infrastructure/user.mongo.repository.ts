import { getDb } from '../../../shared/db/mongo.js';
import type {
  CreateUserInput,
  LoginUserInput,
} from '../domain/user.repository.js';
import * as bcrypt from 'bcrypt';
import type { User } from '../user.types.js';

const USER_COLLECTION = 'user';
const getUserCollection = () => getDb<any>(USER_COLLECTION);

const createUser = async (userData: CreateUserInput): Promise<User> => {
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
  let newUser = {
    email: user.email,
    login: user.login,
    userId: String(result.insertedId),
  }; // надо потм в маппер
  return newUser;
};

const loginUser = async (userData: LoginUserInput): Promise<null | User> => {
  const collection = getUserCollection();
  let user = await collection.findOne({
    login: { $regex: userData.login, $options: 'i' },
  });
  if (!user) return null;
  const match = await bcrypt.compare(userData.password, user.password);
  user = {
    userId: String(user._id),
    email: user.email,
    login: user.login,
  }; // надо потм в маппер

  return match ? user : null; // возвращаю юзердату т.к. лень делать маппер
};

export const UserRepositoryMongo = {
  createUser,
  loginUser,
};
