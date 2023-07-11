const express = require("express");
const config = require("./config");

const app = express();

app.use(express.json());
app.use(require('./logger'));
app.use(require('./routes'));

app.listen(config.port, () => {
  console.log("App server is running at port " + config.port);
});

module.exports = app