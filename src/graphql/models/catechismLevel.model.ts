import mongoose from "mongoose";

const catechismLevelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
});

export const CatechismLevel = mongoose.model("CatechismLevel", catechismLevelSchema);
