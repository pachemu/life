import type { ObjectId } from "mongodb"


export type bookDbModel = {
    _id: ObjectId
    title: string
    author: string
    readPages: number
    totalPages: number
}

export type createBookDbModel =  Omit<bookDbModel, '_id'>

export type updateBookDbModel = {
    title: string | undefined
    author: string | undefined
    readPages: number | undefined
    totalPages: number | undefined
}