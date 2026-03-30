import { ObjectId, type Filter } from 'mongodb';
import { getDb } from '../../../shared/db/mongo.js';
import { AppError } from '../../../shared/errors.js';
import type { Workout } from '../domain/workout.entity.js';
import type { WorkoutQuery } from '../domain/workout.repository.js';
import { workoutMapper } from './workout.mapper.js';
import type { WorkoutDbModel } from './types/workout.db.model.js';

const COLLECTION = 'workouts';

const getCollection = () => getDb<WorkoutDbModel>(COLLECTION);

const findAll = async (ownerId: string): Promise<Workout[]> => {
  const collection = getCollection();
  const docs = await collection.find({ ownerId }).toArray();
  return docs.map(workoutMapper.toDomain);
};

const findByQuery = async (
  ownerId: string,
  query: WorkoutQuery,
): Promise<Workout[]> => {
  const collection = getCollection();
  const filter: Filter<WorkoutDbModel> = { ownerId };

  if (query.date) filter.date = query.date;
  if (query.muscleGroup) {
    Object.assign(filter, {
      'exercises.muscleGroup': {
        $regex: query.muscleGroup,
        $options: 'i',
      },
    } as Filter<WorkoutDbModel>);
  }

  const docs = await collection.find(filter).toArray();
  return docs.map(workoutMapper.toDomain);
};

const findById = async (
  ownerId: string,
  workoutId: string,
): Promise<Workout | null> => {
  const collection = getCollection();
  const doc = await collection.findOne({
    _id: new ObjectId(workoutId),
    ownerId,
  });
  return doc ? workoutMapper.toDomain(doc) : null;
};

const create = async (workout: Workout): Promise<Workout> => {
  const collection = getCollection();
  const dbModel = workoutMapper.toCreateDb(workout);
  const id = (await collection.insertOne(dbModel as WorkoutDbModel)).insertedId;
  const createdWorkout = await collection.findOne({
    _id: id,
    ownerId: workout.ownerId,
  });

  if (!createdWorkout) {
    throw new AppError(500, 'Created workout not found after insert');
  }

  return workoutMapper.toDomain(createdWorkout);
};

const update = async (workout: Workout): Promise<Workout> => {
  const collection = getCollection();
  const { _id, ...updateData } = workoutMapper.toDb(workout);

  await collection.updateOne(
    { _id: new ObjectId(workout.id), ownerId: workout.ownerId },
    { $set: updateData },
  );

  const updatedWorkout = await collection.findOne({
    _id: new ObjectId(workout.id),
    ownerId: workout.ownerId,
  });

  if (!updatedWorkout) {
    throw new AppError(500, 'Updated workout not found after update');
  }

  return workoutMapper.toDomain(updatedWorkout);
};

const deleteById = async (id: string, ownerId: string): Promise<boolean> => {
  const collection = getCollection();
  const result = await collection.deleteOne({ _id: new ObjectId(id), ownerId });
  return result.deletedCount === 1;
};

const deleteAll = async (ownerId: string): Promise<boolean> => {
  const collection = getCollection();
  const result = await collection.deleteMany({ ownerId });
  return result.acknowledged;
};

export const workoutRepositoryMongo = {
  findAll,
  findByQuery,
  findById,
  create,
  update,
  delete: deleteById,
  deleteAll,
};
