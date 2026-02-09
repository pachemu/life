import { Collection, ObjectId, type DeleteResult, type InsertOneResult, type OptionalId, type UpdateResult } from 'mongodb'
import { getDb } from "../../../shared/db/mongo.js"
import type { bookDbModel } from './types/book.db.model.js';
import { bookMapper } from './book.mapper.js';
import type { Book } from '../domain/book.entity.js';
import type { BookQuery, CreateBookInput, UpdateBookInput } from '../domain/book.repository.js';


const COLLECTION = 'books'
const getCollection = () => getDb<bookDbModel>(COLLECTION)


const findAll = async (): Promise <Book[]> => {
    const collection = getCollection()
    let docs = await collection.find().toArray()
    return docs.map(bookMapper.toDomain)
}

const findByQuery = async (query: BookQuery): Promise<Book[]> => {
    const collection = getCollection()
    let docs = await collection.find({title: {$regex: query.title, $options: 'i'}}).toArray()
    return docs.map(bookMapper.toDomain)
}

const findById = async (id: string): Promise<Book | null> => {
    const collection = getCollection()
    let docs = await collection.findOne({_id: new ObjectId(id)})
    return docs ? bookMapper.toDomain(docs): null
    
}

const create = async (dataBook: CreateBookInput): Promise<Book> => {
    const collection = getCollection()
    const dbModel = bookMapper.toCreateDb(dataBook)
    const id = (await collection.insertOne(dbModel as bookDbModel)).insertedId
    const createdBook = await collection.findOne({_id: id});
    if(!createdBook) {
        throw new Error('created book doesnt exist')
    }
    return await bookMapper.toDomain(createdBook)
}

const update = async (id: string, dataBook: UpdateBookInput,): Promise<Book> => {
    const collection = getCollection()
    const result = await collection.updateOne({_id: new ObjectId(id)},{ $set: dataBook})
    const updatedBook = await collection.findOne({_id: new ObjectId(id)})
    if(!updatedBook) {
        throw new Error('created book doesnt exist')
    }
    return bookMapper.toDomain(updatedBook)
}

const deleteById = async (id: string): Promise<boolean> => {
    const collection = getCollection()
    let result = await collection.deleteOne({_id: new ObjectId(id)})
    if(result.deletedCount !== 1) {
        throw new Error('book not found')
    }
    return true
}

const deleteAllBooks = async (): Promise<boolean> => {
    const collection = getCollection()
    let result = await collection.deleteMany({})
    return result.acknowledged

}


export const bookRepositoryMongo = {
    findAll,
    findByQuery,
    findById,
    create,
    update,
    delete : deleteById,
    deleteAll : deleteAllBooks
}
