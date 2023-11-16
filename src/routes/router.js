const express = require("express");
const app = express();

const { guard, withUsuario } = require("../helpers/guard");
const routeWrapper = require("../helpers/routeWrapper");

const enums = require("../schemas/enums");
const { USUARIO_PLANOS } = enums;
const authController = require("../controllers/auth.controller");
const infoController = require("../controllers/info.controller");
const vagaController = require("../controllers/vaga.controller");
const cboController = require("../controllers/cbo.controller");
const habilidadeController = require("../controllers/habilidade.controller");
const qualificacaoController = require("../controllers/qualificacao.controller");
const propostaController = require("../controllers/proposta.controller");

// =====================
// Healthcheck
// =====================

app.get(["/", "/api/health"], (req, res) => {
  res.send({ message: "OK", uptime: process.uptime() });
});

// =====================
// Enums
// =====================

app.get("/api/enums", (req, res) => {
  res.send(enums);
});

// =====================
// Auth
// =====================

app.post("/api/auth/login", routeWrapper(authController.login));
app.post("/api/auth/register", routeWrapper(authController.register));
app.delete("/api/auth/self", guard(), routeWrapper(authController.deleteSelf));
app.post(
  "/api/auth/update-plano",
  guard([USUARIO_PLANOS.MASTER_ADMIN]),
  routeWrapper(authController.updatePlano)
);
app.post(
  "/api/auth/change-user-password",
  guard([USUARIO_PLANOS.MASTER_ADMIN]),
  routeWrapper(authController.changeUserPassword)
);
app.get(
  "/api/auth/elevate/:masterpass",
  guard([]),
  routeWrapper(authController.elevate)
);
app.post(
  "/api/auth/change-password",
  guard(),
  routeWrapper(authController.changePassword)
);
app.post(
  "/api/auth/change-account-type",
  guard(),
  routeWrapper(authController.changeAccountType)
);
app.get("/api/auth/self", guard(), routeWrapper(authController.getSelf));
app.get(
  "/api/auth/users",
  guard([USUARIO_PLANOS.MASTER_ADMIN]),
  routeWrapper(authController.allUsers)
);
app.get(
  "/api/auth/user/:id",
  guard([USUARIO_PLANOS.MASTER_ADMIN]),
  routeWrapper(authController.getSingleUser)
);
app.post(
  "/api/auth/remocao-dados",
  guard(),
  routeWrapper(authController.remocaoDados)
);
app.post(
  "/api/auth/remocao-historico",
  guard(),
  routeWrapper(authController.remocaoHistorico)
);
app.post(
  "/api/auth/remocao-total",
  guard(),
  routeWrapper(authController.remocaoTotal)
);
app.post(
  "/api/auth/forgot-password-send-code",
  routeWrapper(authController.forgotPasswordSendCode)
);
app.post(
  "/api/auth/forgot-password-reset-with-code",
  routeWrapper(authController.forgotPasswordResetWithCode)
);

// =====================
// Personal Data
// =====================

app.get("/api/info/self", guard(), routeWrapper(infoController.getSelf));
app.get(
  "/api/info/other/:id",
  guard([USUARIO_PLANOS.MASTER_ADMIN]),
  routeWrapper(infoController.getById)
);
app.post("/api/info/pf", guard(), routeWrapper(infoController.postPF));
app.post("/api/info/pj", guard(), routeWrapper(infoController.postPJ));
app.post(
  "/api/info/salvar-vaga/:id",
  guard(),
  routeWrapper(infoController.setVagaSalva)
);

// =====================
// CBO - Cadastro Brasileiro de Ocupações
// =====================

app.get("/api/cbo", routeWrapper(cboController.list));
app.post("/api/cbo", guard(), routeWrapper(cboController.create));
app.post(
  "/api/cbo/:id",
  guard([USUARIO_PLANOS.MASTER_ADMIN]),
  routeWrapper(cboController.edit)
);
app.get(
  "/api/cbo/validate/:id",
  guard([USUARIO_PLANOS.MASTER_ADMIN]),
  routeWrapper(cboController.validate)
);
app.get(
  "/api/cbo/invalidate/:id",
  guard([USUARIO_PLANOS.MASTER_ADMIN]),
  routeWrapper(cboController.invalidate)
);
app.delete(
  "/api/cbo/:id",
  guard([USUARIO_PLANOS.MASTER_ADMIN]),
  routeWrapper(cboController.delete)
);
app.post(
  "/api/cbo-import",
  guard([USUARIO_PLANOS.MASTER_ADMIN]),
  routeWrapper(cboController.doImport)
);

// =====================
// Habilidades
// =====================

app.get("/api/habilidade", routeWrapper(habilidadeController.list));
app.post("/api/habilidade", guard(), routeWrapper(habilidadeController.create));
app.post(
  "/api/habilidade/:id",
  guard([USUARIO_PLANOS.MASTER_ADMIN]),
  routeWrapper(habilidadeController.edit)
);
app.delete(
  "/api/habilidade/:id",
  guard([USUARIO_PLANOS.MASTER_ADMIN]),
  routeWrapper(habilidadeController.delete)
);
app.post(
  "/api/habilidade-import",
  guard([USUARIO_PLANOS.MASTER_ADMIN]),
  routeWrapper(habilidadeController.doImport)
);

// =====================
// Qualificacoes
// =====================

app.get("/api/qualificacao", routeWrapper(qualificacaoController.list));
app.post("/api/qualificacao", guard(), routeWrapper(qualificacaoController.create));
app.post(
  "/api/qualificacao/:id",
  guard([USUARIO_PLANOS.MASTER_ADMIN]),
  routeWrapper(qualificacaoController.update)
);
app.get(
  "/api/qualificacao/validate/:id",
  guard([USUARIO_PLANOS.MASTER_ADMIN]),
  routeWrapper(qualificacaoController.validate)
);
app.get(
  "/api/qualificacao/invalidate/:id",
  guard([USUARIO_PLANOS.MASTER_ADMIN]),
  routeWrapper(qualificacaoController.invalidate)
);
app.delete(
  "/api/qualificacao/:id",
  guard(),
  routeWrapper(qualificacaoController.delete)
);

// =====================
// Vagas
// =====================

app.get("/api/vagas", withUsuario, routeWrapper(vagaController.list));
app.get("/api/vagas-salvas", guard([]), routeWrapper(vagaController.listSalvadas));
app.get("/api/vaga/:id", withUsuario, routeWrapper(vagaController.show));
app.get(
  "/api/minhas-vagas",
  guard([
    USUARIO_PLANOS.PJ_FREE,
    USUARIO_PLANOS.PJ_PREMIUM,
    USUARIO_PLANOS.PJ_SMART,
    USUARIO_PLANOS.PJ_ENTERPRISE,
  ]),
  routeWrapper(vagaController.listMine)
);
app.post(
  "/api/vaga",
  guard([
    USUARIO_PLANOS.PJ_FREE,
    USUARIO_PLANOS.PJ_PREMIUM,
    USUARIO_PLANOS.PJ_SMART,
    USUARIO_PLANOS.PJ_ENTERPRISE,
  ]),
  routeWrapper(vagaController.save)
);
app.post(
  "/api/vaga/:id",
  guard([
    USUARIO_PLANOS.PJ_FREE,
    USUARIO_PLANOS.PJ_PREMIUM,
    USUARIO_PLANOS.PJ_SMART,
    USUARIO_PLANOS.PJ_ENTERPRISE,
  ]),
  routeWrapper(vagaController.save)
);
app.delete(
  "/api/vaga/:id",
  guard([
    USUARIO_PLANOS.PJ_FREE,
    USUARIO_PLANOS.PJ_PREMIUM,
    USUARIO_PLANOS.PJ_SMART,
    USUARIO_PLANOS.PJ_ENTERPRISE,
  ]),
  routeWrapper(vagaController.delete)
);

// =====================
// Propostas / Candidaturas
// =====================

app.get(
  "/api/candidaturas",
  guard([
    USUARIO_PLANOS.PF_FREE,
    USUARIO_PLANOS.PF_SMART,
    USUARIO_PLANOS.PF_PREMIUM,
  ]),
  routeWrapper(propostaController.listPF)
);
app.get(
  "/api/candidatura/:id",
  guard([
    USUARIO_PLANOS.PF_FREE,
    USUARIO_PLANOS.PF_SMART,
    USUARIO_PLANOS.PF_PREMIUM,
  ]),
  routeWrapper(propostaController.show)
);
app.post(
  "/api/candidaturas",
  guard([
    USUARIO_PLANOS.PF_FREE,
    USUARIO_PLANOS.PF_SMART,
    USUARIO_PLANOS.PF_PREMIUM,
  ]),
  routeWrapper(propostaController.create)
);
app.delete(
  "/api/candidatura/:id",
  guard([
    USUARIO_PLANOS.PF_FREE,
    USUARIO_PLANOS.PF_SMART,
    USUARIO_PLANOS.PF_PREMIUM,
  ]),
  routeWrapper(propostaController.delete)
);
//
app.get(
  "/api/propostas",
  guard([
    USUARIO_PLANOS.PJ_FREE,
    USUARIO_PLANOS.PJ_PREMIUM,
    USUARIO_PLANOS.PJ_SMART,
    USUARIO_PLANOS.PJ_ENTERPRISE,
  ]),
  routeWrapper(propostaController.listPJ)
);
app.get(
  "/api/proposta/:id",
  guard([
    USUARIO_PLANOS.PJ_FREE,
    USUARIO_PLANOS.PJ_PREMIUM,
    USUARIO_PLANOS.PJ_SMART,
    USUARIO_PLANOS.PJ_ENTERPRISE,
  ]),
  routeWrapper(propostaController.showPJ)
);
app.post(
  "/api/proposta/:id/ver-candidato",
  guard([
    USUARIO_PLANOS.PJ_FREE,
    USUARIO_PLANOS.PJ_PREMIUM,
    USUARIO_PLANOS.PJ_SMART,
    USUARIO_PLANOS.PJ_ENTERPRISE,
  ]),
  routeWrapper(propostaController.verDados)
);
app.post(
  "/api/proposta/:id/set-contratado",
  guard([
    USUARIO_PLANOS.PJ_FREE,
    USUARIO_PLANOS.PJ_PREMIUM,
    USUARIO_PLANOS.PJ_SMART,
    USUARIO_PLANOS.PJ_ENTERPRISE,
  ]),
  routeWrapper(propostaController.setContratado)
);

// =====================

module.exports = app;
