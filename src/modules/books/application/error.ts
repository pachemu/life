export class NotFoundError extends Error {
    constructor(message = 'book not found') {
        super(message)
        this.name = "NotFoundError"
    }
}