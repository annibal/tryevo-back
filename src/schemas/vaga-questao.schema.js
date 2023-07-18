const SchemaFactory = require("./base.schema");

const VagaQuestaoSchema = SchemaFactory({
  titulo: { type: String, required: true },
  tipo: { type: String, default: 'texto' },
  isObrigatorio: { type: Boolean, default: false },
  resposta: { type: String },
});

module.exports = VagaQuestaoSchema;