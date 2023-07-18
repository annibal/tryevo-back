const SchemaFactory = require("./base.schema");

const ProjetosPessoaisSchema = SchemaFactory({
  _id: { type: String, required: true, },

  titulo: { type: String },
  url: { type: String },
  descricao: { type: String },
  quando: { type: String },

}, { _id: false });

module.exports = ProjetosPessoaisSchema;