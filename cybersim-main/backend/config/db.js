import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

let memoryServer;

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI;

  try {
    const conn = await mongoose.connect(mongoUri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    const canFallback = process.env.ALLOW_INMEMORY_DB !== "false";

    if (!canFallback) {
      console.error(`Error: ${error.message}`);
      process.exit(1);
    }

    console.warn(`Primary MongoDB unavailable (${error.message}). Starting in-memory MongoDB fallback.`);

    memoryServer = await MongoMemoryServer.create();
    const inMemoryUri = memoryServer.getUri("cybersim");
    const conn = await mongoose.connect(inMemoryUri);
    console.log(`In-memory MongoDB Connected: ${conn.connection.host}`);
  }
};

process.on("SIGINT", async () => {
  if (memoryServer) {
    await memoryServer.stop();
  }
});

export default connectDB;
