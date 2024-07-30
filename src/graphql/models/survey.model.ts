import mongoose from "mongoose";

const surveySchema = new mongoose.Schema({
  householdSize: {
    type: Number,
    required: true,
  },
  catechumens: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Catechumen",
    required: true,
  }],
  people: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Person",
  }],
  observations: {
    type: String,
    required: false,
  },
  catechists: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Catechist",
  }],
  location: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Location",
  },
}, {
  timestamps: true,
});

export const Survey = mongoose.model("Survey", surveySchema);
