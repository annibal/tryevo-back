const express = require("express");
var cors = require('cors')
const config = require("./config");

const app = express();

app.use(cors())
app.use(express.json());
app.use(require('./logger'));
app.use(require('./routes'));

app.listen(config.port, () => {
  console.log("App server is running at port " + config.port);
});

module.exports = app