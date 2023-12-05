const express = require("express");
const app = express();

const { guard, withUsuario } = require("../helpers/guard");
const routeWrapper = require("../helpers/routeWrapper");

const enums = require("../schemas/enums");
const { TIPO_PLANO_ASSINATURA: T_PLAN } = enums;
const authController = require("../controllers/auth.controller");
const infoController = require("../controllers/info.controller");
const vagaController = require("../controllers/vaga.controller");
const cboController = require("../controllers/cbo.controller");
const habilidadeController = require("../controllers/habilidade.controller");
const qualificacaoController = require("../controllers/qualificacao.controller");
const propostaController = require("../controllers/proposta.controller");
const planAssController = require("../controllers/plano-assinatura.controller");
const dashboardController = require("../controllers/dashboard.controller")

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
  guard([T_PLAN.MA]),
  routeWrapper(authController.updatePlano)
);
app.post(
  "/api/auth/change-user-password",
  guard([T_PLAN.MA]),
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
  guard([T_PLAN.MA]),
  routeWrapper(authController.allUsers)
);
app.get(
  "/api/auth/user/:id",
  guard([T_PLAN.MA]),
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
// Subscription Plans
// =====================

app.get(
  "/api/features-planos-assinatura/",
  routeWrapper(planAssController.handleGetFeatures)
);
app.get(
  "/api/tipos-planos-assinatura/",
  routeWrapper(planAssController.handleGetTipos)
);
app.get("/api/planos-assinatura/", routeWrapper(planAssController.handleGet));
app.get(
  "/api/plano-assinatura/:id",
  routeWrapper(planAssController.handleGetSingle)
);
app.post(
  "/api/plano-assinatura",
  guard([T_PLAN.MA]),
  routeWrapper(planAssController.handlePost)
);
app.delete(
  "/api/plano-assinatura/:id",
  guard([T_PLAN.MA]),
  routeWrapper(planAssController.handleDelete)
);

// =====================
// Personal Data
// =====================

app.get("/api/info/self", guard(), routeWrapper(infoController.getSelf));
app.get(
  "/api/info/other/:id",
  guard([T_PLAN.MA]),
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
app.post("/api/cbo/:id", guard([T_PLAN.MA]), routeWrapper(cboController.edit));
app.get(
  "/api/cbo/validate/:id",
  guard([T_PLAN.MA]),
  routeWrapper(cboController.validate)
);
app.get(
  "/api/cbo/invalidate/:id",
  guard([T_PLAN.MA]),
  routeWrapper(cboController.invalidate)
);
app.delete(
  "/api/cbo/:id",
  guard([T_PLAN.MA]),
  routeWrapper(cboController.delete)
);
app.post(
  "/api/cbo-import",
  guard([T_PLAN.MA]),
  routeWrapper(cboController.doImport)
);

// =====================
// Habilidades
// =====================

app.get("/api/habilidade", routeWrapper(habilidadeController.list));
app.post("/api/habilidade", guard(), routeWrapper(habilidadeController.create));
app.post(
  "/api/habilidade/:id",
  guard([T_PLAN.MA]),
  routeWrapper(habilidadeController.edit)
);
app.delete(
  "/api/habilidade/:id",
  guard([T_PLAN.MA]),
  routeWrapper(habilidadeController.delete)
);
app.post(
  "/api/habilidade-import",
  guard([T_PLAN.MA]),
  routeWrapper(habilidadeController.doImport)
);

// =====================
// Qualificacoes
// =====================

app.get("/api/qualificacao", routeWrapper(qualificacaoController.list));
app.post(
  "/api/qualificacao",
  guard(),
  routeWrapper(qualificacaoController.create)
);
app.post(
  "/api/qualificacao/:id",
  guard([T_PLAN.MA]),
  routeWrapper(qualificacaoController.update)
);
app.get(
  "/api/qualificacao/validate/:id",
  guard([T_PLAN.MA]),
  routeWrapper(qualificacaoController.validate)
);
app.get(
  "/api/qualificacao/invalidate/:id",
  guard([T_PLAN.MA]),
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
app.get(
  "/api/vagas-salvas",
  guard([]),
  routeWrapper(vagaController.listSalvadas)
);
app.get("/api/vaga/:id", withUsuario, routeWrapper(vagaController.show));
app.get(
  "/api/minhas-vagas",
  guard([T_PLAN.PJ]),
  routeWrapper(vagaController.listMine)
);
app.get(
  "/api/count-minhas-vagas",
  guard([T_PLAN.PJ]),
  routeWrapper(vagaController.getCountMyVagasCriadas)
);
app.post("/api/vaga", guard([T_PLAN.PJ]), routeWrapper(vagaController.save));
app.post(
  "/api/vaga/:id",
  guard([T_PLAN.PJ]),
  routeWrapper(vagaController.save)
);
app.delete(
  "/api/vaga/:id",
  guard([T_PLAN.PJ]),
  routeWrapper(vagaController.delete)
);

// =====================
// Propostas / Candidaturas
// =====================

app.get(
  "/api/candidaturas",
  guard([T_PLAN.PF]),
  routeWrapper(propostaController.listPF)
);
app.get(
  "/api/candidatura/:id",
  guard([T_PLAN.PF]),
  routeWrapper(propostaController.show)
);
app.post(
  "/api/candidaturas",
  guard([T_PLAN.PF]),
  routeWrapper(propostaController.create)
);
app.delete(
  "/api/candidatura/:id",
  guard([T_PLAN.PF]),
  routeWrapper(propostaController.delete)
);
app.get(
  "/api/count-candidaturas",
  guard([T_PLAN.PF]),
  routeWrapper(propostaController.getCountPropostas)
);
//
app.get(
  "/api/propostas",
  guard([T_PLAN.PJ]),
  routeWrapper(propostaController.listPJ)
);
app.get(
  "/api/proposta/:id",
  guard([T_PLAN.PJ]),
  routeWrapper(propostaController.showPJ)
);
app.post(
  "/api/proposta/:id/ver-candidato",
  guard([T_PLAN.PJ]),
  routeWrapper(propostaController.verDados)
);
app.post(
  "/api/proposta/:id/set-contratado",
  guard([T_PLAN.PJ]),
  routeWrapper(propostaController.setContratado)
);

// =====================
// Graficos da Dashboard
// =====================

app.get(
  "/api/dashboard/:type/:chart",
  withUsuario,
  routeWrapper(dashboardController.handleGetDashboardData)
);
app.post(
  "/api/dashboard/:type/:chart",
  withUsuario,
  routeWrapper(dashboardController.handlePostDashboardData)
);

// =====================

module.exports = app;
