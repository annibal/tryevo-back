const express = require("express");
const app = express();

const guard = require("../helpers/guard");
const routeWrapper = require("../helpers/routeWrapper");

const authController = require("../controllers/auth.controller");
const { USUARIO_PLANOS } = require("../schemas/enums");


app.get(["/", "/api/health"], (req, res) => {
  res.send({ message: "OK", uptime: process.uptime() });
});

app.post("/auth/login", routeWrapper(authController.login));
app.post("/auth/register", routeWrapper(authController.register));
app.delete("/auth/self", guard(), routeWrapper(authController.deleteSelf));
app.post("/auth/update-plano", guard([USUARIO_PLANOS.MASTER_ADMIN]), routeWrapper(authController.updatePlano));
app.get("/auth/self", guard(), routeWrapper(authController.getSelf));
app.get("/auth/users", guard([USUARIO_PLANOS.MASTER_ADMIN]), routeWrapper(authController.allUsers));




module.exports = app;