const mongoose = require("mongoose");

const username = 'tryevo01';
const password = 'voo1DAR_coox*zon';
const cluster = 'mongodb.tryevo.com.br';
const dbName = 'tryevo01';
const uri = `mongodb://${username}:${encodeURIComponent(password)}@${cluster}/${dbName}?retryWrites=true&w=majority`;

mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error: "));
db.once("open", function () {
  console.log("Connected successfully");
});

module.exports = db;