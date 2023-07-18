const mongoose = require('mongoose');

const SchemaFactory = (schemaDefinition, schemaOptions) => {
  return new mongoose.Schema({
    _id: { type: String, required: true, },
    createdAt: { type: Date },
    updatedAt: { type: Date },
    ownerId: { type: String },
    ...schemaDefinition,
  }, {
    timestamps: true,
    _id: false,
    ...schemaOptions,
  })
}
module.exports = SchemaFactory; 







