import mongoose from "mongoose";

const sacramentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
});

export const Sacrament = mongoose.model("Sacrament", sacramentSchema);
