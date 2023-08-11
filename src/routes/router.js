const express = require("express");
const app = express();

const guard = require("../helpers/guard");
const routeWrapper = require("../helpers/routeWrapper");

const enums = require("../schemas/enums");
const { USUARIO_PLANOS } = enums;
const authController = require("../controllers/auth.controller");
const infoController = require("../controllers/info.controller");
const vagaController = require("../controllers/vaga.controller");
const cboController = require("../controllers/cbo.controller");
const habilidadeController = require("../controllers/habilidade.controller");
const qualificacaoController = require("../controllers/qualificacao.controller");

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
app.get(
  "/auth/elevate/:masterpass",
  guard([]),
  routeWrapper(authController.elevate)
);
app.post(
  "/auth/change-password",
  guard(),
  routeWrapper(authController.changePassword)
);
app.post(
  "/auth/change-account-type",
  guard(),
  routeWrapper(authController.changeAccountType)
);
app.get("/auth/self", guard(), routeWrapper(authController.getSelf));
app.get(
  "/auth/users",
  guard([USUARIO_PLANOS.MASTER_ADMIN]),
  routeWrapper(authController.allUsers)
);
app.get(
  "/auth/user/:id",
  guard([USUARIO_PLANOS.MASTER_ADMIN]),
  routeWrapper(authController.getSingleUser)
);
app.post(
  "/auth/remocao-dados",
  guard(),
  routeWrapper(authController.remocaoDados)
);
app.post(
  "/auth/remocao-historico",
  guard(),
  routeWrapper(authController.remocaoHistorico)
);
app.post(
  "/auth/remocao-total",
  guard(),
  routeWrapper(authController.remocaoTotal)
);

// =====================
// Personal Data
// =====================

app.get("/info/self", guard(), routeWrapper(infoController.getSelf));
app.get("/info/other/:id", guard([USUARIO_PLANOS.MASTER_ADMIN]), routeWrapper(infoController.getById));
app.post("/info/pf", guard(), routeWrapper(infoController.postPF));
app.post("/info/pj", guard(), routeWrapper(infoController.postPJ));

// =====================
// CBO - Cadastro Brasileiro de Ocupações
// =====================

app.get("/cbo", routeWrapper(cboController.list));
app.post("/cbo", guard(), routeWrapper(cboController.create));
app.post("/cbo/:id", guard([USUARIO_PLANOS.MASTER_ADMIN]), routeWrapper(cboController.edit));
app.get(
  "/cbo/validate/:id",
  guard([USUARIO_PLANOS.MASTER_ADMIN]),
  routeWrapper(cboController.validate)
);
app.get(
  "/cbo/invalidate/:id",
  guard([USUARIO_PLANOS.MASTER_ADMIN]),
  routeWrapper(cboController.invalidate)
);
app.delete(
  "/cbo/:id",
  guard([USUARIO_PLANOS.MASTER_ADMIN]),
  routeWrapper(cboController.delete)
);
app.post(
  "/cbo-import",
  guard([USUARIO_PLANOS.MASTER_ADMIN]),
  routeWrapper(cboController.doImport)
);

// =====================
// Habilidades
// =====================

app.get("/habilidade", routeWrapper(habilidadeController.list));
app.post("/habilidade", guard(), routeWrapper(habilidadeController.create));
app.post("/habilidade/:id", guard([USUARIO_PLANOS.MASTER_ADMIN]), routeWrapper(habilidadeController.edit));
app.delete(
  "/habilidade/:id",
  guard([USUARIO_PLANOS.MASTER_ADMIN]),
  routeWrapper(habilidadeController.delete)
);
app.post(
  "/habilidade-import",
  guard([USUARIO_PLANOS.MASTER_ADMIN]),
  routeWrapper(habilidadeController.doImport)
);

// =====================
// Qualificacoes
// =====================

app.get("/qualificacao", routeWrapper(qualificacaoController.list));
app.post(
  "/qualificacao",
  guard(),
  routeWrapper(qualificacaoController.create)
);
app.post(
  "/qualificacao/:id",
  guard([USUARIO_PLANOS.MASTER_ADMIN]),
  routeWrapper(qualificacaoController.update)
);
app.get(
  "/qualificacao/validate/:id",
  guard([USUARIO_PLANOS.MASTER_ADMIN]),
  routeWrapper(qualificacaoController.validate)
);
app.get(
  "/qualificacao/invalidate/:id",
  guard([USUARIO_PLANOS.MASTER_ADMIN]),
  routeWrapper(qualificacaoController.invalidate)
);
app.delete(
  "/qualificacao/:id",
  guard(),
  routeWrapper(qualificacaoController.delete)
);

// =====================
// Vagas
// =====================

app.get("/vagas", routeWrapper(vagaController.list));
app.get("/vaga/:id", routeWrapper(vagaController.show));
app.get(
  "/minhas-vagas",
  guard([
    USUARIO_PLANOS.PJ_FREE,
    USUARIO_PLANOS.PJ_PREMIUM,
    USUARIO_PLANOS.PJ_SMART,
    USUARIO_PLANOS.PJ_ENTERPRISE,
  ]),
  routeWrapper(vagaController.listMine)
);
app.post(
  "/vaga",
  guard([
    USUARIO_PLANOS.PJ_FREE,
    USUARIO_PLANOS.PJ_PREMIUM,
    USUARIO_PLANOS.PJ_SMART,
    USUARIO_PLANOS.PJ_ENTERPRISE,
  ]),
  routeWrapper(vagaController.save)
);
app.post(
  "/vaga/:id",
  guard([
    USUARIO_PLANOS.PJ_FREE,
    USUARIO_PLANOS.PJ_PREMIUM,
    USUARIO_PLANOS.PJ_SMART,
    USUARIO_PLANOS.PJ_ENTERPRISE,
  ]),
  routeWrapper(vagaController.save)
);
app.delete(
  "/vaga/:id",
  guard([
    USUARIO_PLANOS.PJ_FREE,
    USUARIO_PLANOS.PJ_PREMIUM,
    USUARIO_PLANOS.PJ_SMART,
    USUARIO_PLANOS.PJ_ENTERPRISE,
  ]),
  routeWrapper(vagaController.delete)
);

// =====================

module.exports = app;
