export class AppError extends Error {
    constructor(public status: number, message: string) { 
        super(message)
    }
}

export class NotFoundError extends AppError {
    constructor(message = 'not found' ) {
        super(404, message)
    }
}


export const errors = {
    AppError,
    NotFoundError,

}
