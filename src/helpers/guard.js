const jwt = require("jsonwebtoken");
const config = require("../config");
const { USUARIO_PLANOS } = require("../schemas/enums");

const getToken = (req) => {
  let str = req?.headers?.authorization;
  if (!str) str = req?.headers?.Authorization;
  if (!str) str = req?.headers?.AUTHORIZATION;
  if (!str) return null;
  str = str.replace("Bearer ", "");
  str = str.replace("bearer ", "");
  return str;
};

const guard =
  (planos = []) =>
  (req, res, next) => {
    const token = getToken(req);
    if (token) {
      jwt.verify(token, config.jwtSecret, (error, decodedToken) => {
        if (error) {
          return res.status(401).send({ message: "Not authorized", error });
        } else {
          let isAuthorized = !planos || planos.length < 1 || planos.includes(decodedToken.plano);
          if (decodedToken.plano === USUARIO_PLANOS.MASTER_ADMIN) isAuthorized = true;
          if (isAuthorized) {
            req.usuario = {
              _id: decodedToken._id,
              email: decodedToken.email,
              plano: decodedToken.plano,
              createdAt: decodedToken.createdAt,
              updatedAt: decodedToken.updatedAt,
            };
            next();
          } else {
            return res
              .status(401)
              .send({
                message: `Not authorized for access level "${decodedToken.plano}"`,
              });
          }
        }
      });
    } else {
      return res
        .status(401)
        .send({ message: "Not authorized, token not available" });
    }
  };

module.exports = guard;
