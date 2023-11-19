const jwt = require("jsonwebtoken");
const config = require("../config");
const { TIPO_FEATURE_PLANO_ASSINATURA: FEATS } = require("../schemas/enums");

const getToken = (req) => {
  let str = req?.headers?.authorization;
  if (!str) str = req?.headers?.Authorization;
  if (!str) str = req?.headers?.AUTHORIZATION;
  if (!str) return null;
  str = str.replace("Bearer ", "");
  str = str.replace("bearer ", "");
  return str;
};

const parseUser = (decodedToken) => {
  const plano = {
    _id: decodedToken.plano?._id,
    nome: decodedToken.plano?.nome,
    tipo: decodedToken.plano?.tipo,
    features: decodedToken.plano?.features || {},
  };

  return {
    _id: decodedToken._id,
    email: decodedToken.email,
    plano,
    isMasterAdmin: !!plano.features[FEATS.ADMIN],
    createdAt: decodedToken.createdAt,
    updatedAt: decodedToken.updatedAt,
  };
};

const withUsuario = (req, res, next) => {
  const token = getToken(req);
  req.usuario = {};
  if (token) {
    jwt.verify(token, config.jwtSecret, (error, decodedToken) => {
      if (!error) {
        req.usuario = parseUser(decodedToken);
      }
    });
  }
  next();
};

const guard =
  (tipos = [], features = []) =>
  (req, res, next) => {
    const token = getToken(req);
    if (token) {
      jwt.verify(token, config.jwtSecret, (error, decodedToken) => {
        if (error) {
          return res.status(401).send({ message: "Not authorized", error });
        } else {
          const user = parseUser(decodedToken);

          let isAuthorized = true;

          if (tipos?.length > 0) {
            if (!tipos.includes(user.plano.tipo)) {
              isAuthorized = false;
            }
          }

          if (features?.length > 0) {
            for (let i = 0; i < features.length; i++) {
              if (!user.plano.features[features[i]]) {
                isAuthorized = false;
                break;
              }
            }
          }

          if (user.isMasterAdmin) {
            isAuthorized = true;
          }

          if (isAuthorized) {
            req.usuario = user;
            next();
          } else {
            return res.status(401).send({
              message: `Not authorized for access level "${decodedToken.plano.tipo} - ${decodedToken.plano.nome}"`,
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

module.exports = {
  guard,
  withUsuario,
};
