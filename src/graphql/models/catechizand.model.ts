import mongoose from "mongoose";

const catechizandSchema = new mongoose.Schema({
  person: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Person",
    required: true,
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true,
  },
}, {
  timestamps: true,
});

export const Catechizand = mongoose.model("Catechizand", catechizandSchema);
