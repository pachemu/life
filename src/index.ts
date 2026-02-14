import { app } from './app.js';
import { connectToDatabase } from './shared/db/mongo.js';
import { ENV } from './shared/env.js';

const PORT = ENV.port || 3000;

export async function startServer() {
  await connectToDatabase('life');
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

startServer();
