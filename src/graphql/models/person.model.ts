import mongoose from "mongoose";

const personSchema = new mongoose.Schema({
  idCard: {
    type: String,
    required: false,
  },
  name: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: false,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address'],
  },
  phone: {
    type: String,
    required: false,
  },
  birthDate: {
    type: Date,
    required: false,
  },
  sacraments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Sacrament",
  }],
}, {
  timestamps: true,
});

export const Person = mongoose.model("Person", personSchema);
