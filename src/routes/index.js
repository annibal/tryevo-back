const express = require("express");
const app = express();

app.get(["/", "/api/health"], (req, res) => {
  res.send({ message: "OK", uptime: process.uptime() });
});

app.use(require("./auth.routes"));
app.use(require("./usuario.routes"));
app.use(require("./pf.routes"));
app.use(require("./pj.routes"));
app.use(require("./vaga.routes"));
app.use(require("./proposta.routes"));
app.use(require("./endereco.routes"));

module.exports = app;