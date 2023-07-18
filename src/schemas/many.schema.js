const SchemaFactory = require("./base.schema");

const ManySchema = SchemaFactory({
  _id: { type: String, required: true },

  valor: { type: String, required: true },
  descricao: { type: String },
  tipo: { type: String },
  isPrimario: { type: Boolean, default: false },
  
}, { _id: false });

module.exports = ManySchema;