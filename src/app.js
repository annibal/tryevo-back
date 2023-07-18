const express = require("express");
var cors = require('cors')
const config = require("./config");

const app = express();

app.use(cors())
app.use(express.json());
app.use(require('./logger'));
app.use(require('./routes'));

app.listen(config.port, () => {
  console.log(">: app.js: Server running at port " + config.port);
});

process.on("unhandledRejection", err => {
  console.log(`>: An error occurred: ${err.message}`)
  console.trace(err);
  server.close(() => process.exit(1))
})

module.exports = app