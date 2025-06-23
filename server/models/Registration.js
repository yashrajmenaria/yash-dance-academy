const mongoose = require("mongoose");

const RegistrationSchema = new mongoose.Schema({
  title: String,
  name: String,
  age: Number,
  email: String,
  altEmail: String,
  phone: String,
  experience: String,
  style: String,
  danceVideoPath: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Registration", RegistrationSchema);
