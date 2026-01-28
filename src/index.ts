import { app } from "./app.js"
import { connectToDatabase } from "./db/mongo.js"

const PORT = process.env.APP_PORT || 3000

export async function startServer() {
    await connectToDatabase('life')
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`)
    })
}

startServer()