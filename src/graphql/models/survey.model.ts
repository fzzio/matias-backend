import mongoose from "mongoose";

const surveySchema = new mongoose.Schema({
  householdSize: {
    type: Number,
    required: true,
  },
  catechizandsInHousehold: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Person",
    required: true,
  }],
  nonParticipants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Person",
  }],
  observations: {
    type: String,
    required: false,
  },
}, {
  timestamps: true,
});

export const Survey = mongoose.model("Survey", surveySchema);
