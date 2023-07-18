const SchemaFactory = require("./base.schema");

const VagaQuestaoSchema = SchemaFactory({
  _id: { type: String, required: true },

  titulo: { type: String, required: true },
  tipo: { type: String, default: 'texto' },
  isObrigatorio: { type: Boolean, default: false },
  resposta: { type: String },
  
}, { _id: false });

module.exports = VagaQuestaoSchema;