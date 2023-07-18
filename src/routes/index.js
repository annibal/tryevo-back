const express = require("express");
const app = express();

const guard = require("../helpers/guard");
const routeWrapper = require("../helpers/routeWrapper");

const enums = require("../schemas/enums");
const { USUARIO_PLANOS } = enums;
const authController = require("../controllers/auth.controller");
const qualificacaoController = require("../controllers/qualificacao.controller");
const infoController = require("../controllers/info.controller");

// =====================
// Healthcheck
// =====================

app.get(["/", "/api/health"], (req, res) => {
  res.send({ message: "OK", uptime: process.uptime() });
});

// =====================
// Enums
// =====================

app.get("/enums", (req, res) => {
  res.send(enums);
});

// =====================
// Auth
// =====================

app.post("/auth/login", routeWrapper(authController.login));
app.post("/auth/register", routeWrapper(authController.register));
app.delete("/auth/self", guard(), routeWrapper(authController.deleteSelf));
app.post(
  "/auth/update-plano",
  guard([USUARIO_PLANOS.MASTER_ADMIN]),
  routeWrapper(authController.updatePlano)
);
app.get("/auth/self", guard(), routeWrapper(authController.getSelf));
app.get(
  "/auth/users",
  guard([USUARIO_PLANOS.MASTER_ADMIN]),
  routeWrapper(authController.allUsers)
);

// =====================
// Qualificacoes
// =====================

app.get("/qualificacoes", routeWrapper(qualificacaoController.list));
app.post("/qualificacoes", guard(), routeWrapper(qualificacaoController.create));
app.post("/qualificacoes/:id", guard(), routeWrapper(qualificacaoController.update));
app.delete("/qualificacoes/:id", guard(), routeWrapper(qualificacaoController.delete));

// =====================
// Personal Data
// =====================

app.get("/info/self", guard(), infoController.getSelf);
app.post("/info/pf", guard(), infoController.postPF);
app.post("/info/pj", guard(), infoController.postPJ);

// =====================

module.exports = app;
