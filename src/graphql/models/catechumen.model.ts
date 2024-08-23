import mongoose from "mongoose";

const catechumenSchema = new mongoose.Schema({
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
  coursesAsCatechumen: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
  }],
  location: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Location",
    required: false,
  },
  address: {
    type: String,
    required: false,
  },
}, {
  timestamps: true,
});

export const Catechumen = mongoose.model("Catechumen", catechumenSchema);
