const SchemaFactory = require("./base.schema");
const {
  TIPO_PLANO_ASSINATURA,
  TIPO_FEATURE_PLANO_ASSINATURA,
} = require("./enums");

const PlanoAssinatura = SchemaFactory({
  nome: { type: String, required: true },
  descricao: { type: String },
  active: { type: Boolean, default: true },
  tipo: {
    type: String,
    required: true,
    enum: Object.values(TIPO_PLANO_ASSINATURA),
  },
  defaultForTipo: { type: Boolean, default: false },
  features: {
    type: [
      {
        chave: {
          type: String,
          required: true,
          enum: Object.values(TIPO_FEATURE_PLANO_ASSINATURA),
        },
        valor: { type: Number, required: true },
      },
    ],
  },
  modosDePagamento: {
    type: [
      {
        preco: { type: Number, default: 0 },
        meses: { type: Number, default: 1 },
        nome: { type: String, default: "Mensal" },
        pagbankGatewayId: { type: String }
      }
    ],
    required: true,
  }
});

module.exports = PlanoAssinatura;
