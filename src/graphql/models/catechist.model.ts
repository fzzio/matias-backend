import mongoose from "mongoose";

const catechistSchema = new mongoose.Schema({
  person: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Person",
    required: true,
  },
  courses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
  }],
}, {
  timestamps: true,
});

export const Catechist = mongoose.model("Catechist", catechistSchema);
