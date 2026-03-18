import { getDb } from '../../../shared/db/mongo.js';
import type {
  CreateUserInput,
  LoginUserInput,
} from '../domain/user.repository.js';
import * as bcrypt from 'bcrypt';
import type { User, UserData, UserDbModel } from '../user.types.js';
import { MongoServerError, ObjectId } from 'mongodb';
import { userMappers } from './user.mapper.js';

const ensureIndexes = async (): Promise<void> => {
  const collection = getUserCollection();

  await collection.createIndexes([
    { key: { email: 1 }, unique: true },
    { key: { login: 1 }, unique: true },
  ]);
};

const USER_COLLECTION = 'user';
const getUserCollection = () => getDb<UserDbModel>(USER_COLLECTION);

const createUser = async (userData: CreateUserInput): Promise<User | null> => {
  const collection = getUserCollection();

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(userData.password, salt);

  const userForInsert: Omit<UserDbModel, '_id'> = {
    date: new Date().toISOString(),
    password: hashedPassword,
    login: userData.login,
    email: userData.email,
    isConfirmed: false,
    confirmationCode: userData.confirmationCode,
    expirationCodeTime: userData.expirationCodeTime,
    refreshTokenHash: null,
  };

  try {
    const result = await collection.insertOne(userForInsert as UserDbModel);
    return userMappers.toDomainUser({
      _id: result.insertedId,
      ...userForInsert,
    });
  } catch (e) {
    if (e instanceof MongoServerError && e.code === 11000) {
      return null;
    }
    throw e;
  }
};

const loginUser = async (userData: LoginUserInput): Promise<null | User> => {
  const collection = getUserCollection();
  let user = await collection.findOne({
    // login: { $regex: userData.login, $options: 'i' },
    login: userData.login,
  });
  if (!user) return null;
  const match = await bcrypt.compare(userData.password, user.password);
  let goodUser = userMappers.toDomainUser(user);

  return match ? goodUser : null;
};

const getAllUsers = async (): Promise<User[]> => {
  const collection = getUserCollection();
  let users = await collection.find();
  let foundUsers = users
    .map((user) => userMappers.toDomainUser(user))
    .toArray();
  return foundUsers;
};

const deleteUser = async (userId: string): Promise<boolean> => {
  const collection = getUserCollection();
  let deletedUser = await collection.deleteOne({ _id: new ObjectId(userId) });
  return deletedUser.deletedCount === 1;
};

const findById = async (userId: string): Promise<User | null> => {
  const collection = getUserCollection();
  const user = await collection.findOne({ _id: new ObjectId(userId) });
  return user ? userMappers.toDomainUser(user) : null;
};

const findByVerificationCode = async (code: string): Promise<User | null> => {
  const collection = getUserCollection();
  let user = await collection.findOne({
    confirmationCode: code,
  });
  if (!user) return null;
  let foundUser = userMappers.toDomainUser(user);
  return foundUser;
};

const confirmUser = async (userId: string): Promise<boolean> => {
  const collection = getUserCollection();
  const res = await collection.updateOne(
    { _id: new ObjectId(userId) },
    {
      $set: { isConfirmed: true },
      $unset: { confirmationCode: '', expirationCodeTime: '' },
    },
  );
  return res.matchedCount === 1;
};

const updateRefreshToken = async (
  userId: string,
  refreshTokenHash: string | null,
): Promise<boolean> => {
  const collection = getUserCollection();
  const res = await collection.updateOne(
    { _id: new ObjectId(userId) },
    { $set: { refreshTokenHash } },
  );
  return res.matchedCount === 1;
};
export const UserRepositoryMongo = {
  createUser,
  loginUser,
  getAllUsers,
  deleteUser,
  findById,
  findByVerificationCode,
  confirmUser,
  updateRefreshToken,
};
