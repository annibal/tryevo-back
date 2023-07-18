const SchemaFactory = require("./base.schema");

const ManySchema = SchemaFactory({
  valor: { type: String, required: true },
  descricao: { type: String },
  tipo: { type: String },
  isPrimario: { type: Boolean, default: false },
  
});

module.exports = ManySchema;