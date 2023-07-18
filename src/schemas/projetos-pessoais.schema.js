const SchemaFactory = require("./base.schema");

const ProjetosPessoaisSchema = SchemaFactory({
  titulo: { type: String },
  url: { type: String },
  descricao: { type: String },
  quando: { type: String },
});

module.exports = ProjetosPessoaisSchema;