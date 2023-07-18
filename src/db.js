const mongoose = require("mongoose");
const config = require("./config");

const uri = `mongodb://${config.username}:${encodeURIComponent(config.password)}@${config.cluster}/${config.dbName}?retryWrites=true&w=majority`;

mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error: "));
db.once("open", function () {
  console.log(`>: db.js Connected at ${config.cluster}/${config.dbName}`);
});

module.exports = db;