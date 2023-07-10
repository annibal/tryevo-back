const express = require("express");
const app = express();

app.get(["/", "/api/health"], (req, res) => {
  res.send({ message: "OK", uptime: process.uptime() });
});

app.use(require("./user.routes"));

module.exports = app;