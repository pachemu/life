import { Collection, Db, MongoClient } from "mongodb";
import type { Document } from "mongodb"
import { ENV } from "../env.js";

const URL = ENV.mongoUrl || 'mongodb://localhost:27017'
let client: MongoClient = new MongoClient(URL)
let db: Db | null;

export async function connectToDatabase(dbName: string) {
    try {
        await client.connect()
        db = client.db(dbName)
        console.log('mongoDb connected to database:', dbName)
    } catch (error) {
        console.log('mongoDb couldnt connect, error:', error)
    }
}

export function getDb <T extends Document>  (name: string): Collection<T> {
    if(!db) {
        throw new Error('Database not connected. Call connectToDatabase first.')
    }
    return db.collection<T>(name)
}

export async function disconnectToDatabase() {
    try {
        await client.close()
        console.log('disconnect mongoDb')
    } catch(error) {
        console.log('mongo db couldnt disconnect, error:', error)
    }
}