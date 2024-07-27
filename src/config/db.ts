import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const transformDocument = (doc: any, ret: any) => {
  if (ret._id) {
    ret.id = ret._id.toString();
    delete ret._id;
  }
  delete ret.__v;

  for (const key in ret) {
    if (ret.hasOwnProperty(key) && typeof ret[key] === 'object' && ret[key] !== null) {
      ret[key] = transformDocument(doc, ret[key]);
    }
  }

  return ret;
};

mongoose.set('toJSON', {
  transform: transformDocument
});

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

export default connectDB;