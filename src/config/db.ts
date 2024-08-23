import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const transformDocument = (doc: any, ret: any) => {
  const transformed: any = {};

  for (const key in ret) {
    if (ret.hasOwnProperty(key)) {
      if (key === '_id') {
        transformed.id = ret._id.toString();
      } else if (ret[key] instanceof mongoose.Types.ObjectId) {
        transformed[key] = ret[key].toString();
      } else if (Array.isArray(ret[key])) {
        transformed[key] = ret[key].map((item: any) =>
          item instanceof mongoose.Types.ObjectId ? item.toString() :
          (typeof item === 'object' && item !== null) ? transformDocument(doc, item) : item
        );
      } else if (typeof ret[key] === 'object' && ret[key] !== null) {
        transformed[key] = transformDocument(doc, ret[key]);
      } else {
        transformed[key] = ret[key];
      }
    }
  }

  return transformed;
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