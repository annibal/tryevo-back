const express = require("express");
const app = express();
const userModel = require("../models/user.model");
const id6 = require("../helpers/id6");

app.post("/add_user", async (req, res) => {
  
  const data = req.body;
  data._id = id6();
  const user = new userModel(data);

  try {
    await user.save();
    res.send(user);
  } catch (error) {
    res.status(500).send(error);
  }
});

app.get("/users", async (req, res) => {
  const users = await userModel.find({});

  try {
    res.send(users);
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = app;