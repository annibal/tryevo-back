const SchemaFactory = require("./base.schema");
const { TIPO_PLANO_ASSINATURA, TIPO_FEATURE_PLANO_ASSINATURA } = require("./enums");

const PlanoAssinatura = SchemaFactory({
  nome: { type: String, required: true },
  descricao: { type: String },
  active: { type: Boolean, default: true },
  preco: { type: Number, default: 0 },
  descontoAnual: { type: Number, default: 0 },
  tipo: { type: String, required: true, enum: Object.values(TIPO_PLANO_ASSINATURA) },
  defaultForTipo: { type: Boolean, default: false },
  features: {
    type: [
      { key: { type: String, required: true, enum: Object.values(TIPO_FEATURE_PLANO_ASSINATURA)} },
      { value: { type: Number, required: true } }
    ]
  }
});

module.exports = PlanoAssinatura;