import type { Filter } from 'mongodb';
import { getDb } from '../../../shared/db/mongo.js';
import { AppError } from '../../../shared/errors.js';
import type { Nutrition } from '../domain/nutrition.entity.js';
import type {
  NutritionQuery,
  CreateDailyNutritionInput,
  UpdateDailyNutritionInput,
} from '../domain/nutrition.repository.js';
import { nutritionMapper } from './nutrition.mapper.js';
import type { NutritionDbModel } from './types/nutrition.db.model.js';

const COLLECTION = 'nutrition';

const getCollection = () => getDb<NutritionDbModel>(COLLECTION);

const findAll = async (ownerId: string): Promise<Nutrition[]> => {
  const collection = getCollection();
  let docs = await collection.find({ ownerId }).toArray();
  return docs.map(nutritionMapper.toDomain);
};

const findByQuery = async (
  ownerId: string,
  query: NutritionQuery,
): Promise<Nutrition[]> => {
  const collection = getCollection();
  const filter: Filter<NutritionDbModel> = { ownerId };
  if (query.date) filter.date = query.date;

  const docs = await collection.find(filter).toArray();
  return docs.map(nutritionMapper.toDomain);
};

const findByDate = async (
  date: string,
  ownerId: string,
): Promise<Nutrition | null> => {
  const collection = getCollection();
  let docs = await collection.findOne({ date, ownerId });
  return docs ? nutritionMapper.toDomain(docs) : null;
};

const create = async (
  ownerId: string,
  nutritionData: CreateDailyNutritionInput,
): Promise<Nutrition> => {
  const collection = getCollection();
  const dbModel = nutritionMapper.toCreateDb(ownerId, nutritionData);
  await collection.insertOne(dbModel as NutritionDbModel);
  const createdNutrition = await collection.findOne({
    date: nutritionData.date,
    ownerId,
  });
  if (!createdNutrition) {
    throw new AppError(500, 'Created nutrition not found after insert');
  }
  return nutritionMapper.toDomain(createdNutrition);
};

const update = async (
  date: string,
  ownerId: string,
  nutritionData: UpdateDailyNutritionInput,
): Promise<Nutrition> => {
  const collection = getCollection();
  const updateData = nutritionMapper.toUpdateDb(nutritionData);
  await collection.updateOne({ date, ownerId }, { $set: updateData });

  const targetDate = nutritionData.date ?? date;
  const updatedNutrition = await collection.findOne({ date: targetDate, ownerId });
  if (!updatedNutrition) {
    throw new AppError(500, 'Updated nutrition not found after update');
  }
  return nutritionMapper.toDomain(updatedNutrition);
};

const deleteByDate = async (date: string, ownerId: string): Promise<boolean> => {
  const collection = getCollection();
  let result = await collection.deleteOne({ date, ownerId });
  return result.deletedCount === 1;
};

const deleteAllNutrition = async (ownerId: string): Promise<boolean> => {
  const collection = getCollection();
  let result = await collection.deleteMany({ ownerId });
  return result.acknowledged;
};

export const nutritionRepositoryMongo = {
  findAll,
  findByQuery,
  findByDate,
  create,
  update,
  delete: deleteByDate,
  deleteAll: deleteAllNutrition,
};
