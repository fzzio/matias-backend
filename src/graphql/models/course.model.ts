import mongoose from "mongoose";

const courseSchema = new mongoose.Schema({
  year: {
    type: String,
    required: true,
  },
  room: {
    type: String,
    required: true,
  },
  description: {
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
    ref: "Catechist",
    required: true,
  }],
  catechumens: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Catechumen",
  }],
}, {
  timestamps: true,
});

export const Course = mongoose.model("Course", courseSchema);
