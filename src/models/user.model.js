const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  age: {
    type: Number,
    default: 0,
  },
}, { _id: false });

const User = mongoose.model("User", UserSchema);

module.exports = User;