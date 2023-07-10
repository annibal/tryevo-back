const express = require("express");

const app = express();

app.use(express.json());
app.use(require('./logger'));
app.use(require('./routes'));

app.listen(3000, () => {
  console.log("App server is running at port 3000");
});

module.exports = app