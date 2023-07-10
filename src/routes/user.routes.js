const express = require("express");
const app = express();
const userModel = require("../models/user.model");

app.post("/add_user", async (req, res) => {
  console.log(req.body)
  const user = new userModel(req.body);

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