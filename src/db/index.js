import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      console.error("MONGODB_URI not defined in environment variables");
      process.exit(1);
    }
    const dbName = process.env.DB_NAME;
    const fullUri = dbName ? `${uri.replace(/\/?$/, "")}/${dbName}` : uri;
    const connectionInstance = await mongoose.connect(fullUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log(`MongoDB connected! Host: ${connectionInstance.connection.host}, DB: ${connectionInstance.connection.name}`);
  } catch (error) {
    console.error("MongoDB Connection Error:", error);
    process.exit(1);
  }
};

export default connectDB;
