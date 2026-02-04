import { Collection, ObjectId, type DeleteResult, type InsertOneResult, type OptionalId, type UpdateResult } from 'mongodb'
import { getDb } from "../../../shared/db/mongo.js"
import type { bookDbModel, createBookDbModel } from './types/book.db.model.js';
import { bookMapper } from './book.mapper.js';
import type { Book } from '../domain/book.entity.js';
import type { CreateBookInput, UpdateBookInput } from '../domain/book.repository.js';


const COLLECTION = 'books'
const getCollection = () => getDb<bookDbModel>(COLLECTION)




const findAll = async (): Promise<Book[]> => {
    const collection = getCollection()
    let docs = await collection.find().toArray()
    return docs.map(bookMapper.toDomain)
}

const findById = async (id: string): Promise<Book | null> => {
    const collection = getCollection()
    let docs = await collection.findOne({_id: new ObjectId(id)})
    return docs ? bookMapper.toDomain(docs): null
    
}

const create = async (dataBook: CreateBookInput): Promise<string> => {
    const collection = getCollection()
    const dbModel = bookMapper.toCreateDb(dataBook)
    const id = (await collection.insertOne(dbModel as bookDbModel)).insertedId
    return await id.toString()
}

const update = async (id: string, dataBook: UpdateBookInput,): Promise<boolean> => {
    const collection = getCollection()
    const updateDataBook = bookMapper.toUpdateDb(dataBook)
    const result = await collection.updateOne({_id: new ObjectId(id)},{ $set: updateDataBook})
    return result.matchedCount === 1
}

const deleteById = async (id: string): Promise<boolean> => {
    const collection = getCollection()
    let result = await collection.deleteOne({_id: new ObjectId(id)})
    return result.deletedCount === 1
}


export const bookRepositoryMongo = {
    findAll,
    findById,
    create,
    update,
    delete : deleteById
}
