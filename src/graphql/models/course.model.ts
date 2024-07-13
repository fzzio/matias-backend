import mongoose from "mongoose";

const courseSchema = new mongoose.Schema({
  year: {
    type: String,
    required: true,
  },
  catechismLevel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "CatechismLevel",
    required: true,
  },
  location: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Location",
    required: true,
  },
  catechists: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Person",
    required: true,
  }],
  catechizands: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Person",
  }],
}, {
  timestamps: true,
});

export const Course = mongoose.model("Course", courseSchema);