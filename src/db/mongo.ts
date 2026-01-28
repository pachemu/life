import { MongoClient } from "mongodb";

const URL = process.env.MONGO_URL || 'mongodb://localhost:27017'
let client: MongoClient = new MongoClient(URL)
let db: any;

export async function connectToDatabase(dbName: string) {
    try {
        await client.connect()
        db = client.db(dbName)
        console.log('mongoDb connected to database:', dbName)
    } catch (error) {
        console.log('mongoDb couldnt connect, error:', error)
    }
}