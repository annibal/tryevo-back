const mongoose = require("mongoose");
const id6 = require("../helpers/id6");
const CboSchema = require("../schemas/cbo.schema");
const CboModel = mongoose.model("CBO", CboSchema);

exports.list = async (req, res) => {
  const { from = 0, to = 30, q, valid } = req.query;

  let search = { valid: true };
  if (valid != null) {
    search = {};
    if (valid === 'yes') search.valid = true;
    if (valid === 'no') search.valid = false;
  }
  if (q) {
    search.nome = { $regex: q, $options: "i" };
  }

  const total = await CboModel.countDocuments(search);
  let data = await CboModel.find(search)
    .skip(from)
    .limit(to - from)
    .exec();

  return {
    data,
    meta: {
      total,
      from,
      to,
      q,
      search,
    },
  };
};

exports.create = async (req, res) => {
  const data = {
    _id: id6(),
    nome: req.body.nome,
    codigo: req.body.codigo,
    valid: false,
  };
  return await CboModel.create(data);
};
exports.edit = async (req, res) => {
  const cbo = await CboModel.findByIdAndUpdate(
    req.params.id,
    {
      nome: req.body.nome,
      codigo: req.body.codigo,
    },
    {
      new: true,
      runValidators: true,
    }
  );
  if (!cbo) throw new Error('CBO Não encontrado');
  
  return cbo;
};

exports.validate = async (req, res) => {
  return await CboModel.findByIdAndUpdate(
    req.params.id,
    {
      valid: true,
    },
    {
      new: true,
      runValidators: true,
    }
  );
};

exports.invalidate = async (req, res) => {
  return await CboModel.findByIdAndUpdate(
    req.params.id,
    {
      valid: false,
    },
    {
      new: true,
      runValidators: true,
    }
  );
};

exports.delete = async (req, res) => {
  const cbo = await CboModel.findByIdAndDelete(req.params.id);
  if (!cbo) throw new Error('CBO Não encontrado');
  return cbo;
};

exports.doImport = async (req, res) => {
  if (!req.body.lista) throw new Error('Lista para importar cbos não informada');

  const items = req.body.lista.split('\n').map(x => {
    const row = x.split('\t');
    const data = {
      _id: id6(),
      codigo: row[0],
      nome: row[1],
      valid: true,
    }
    if (row.length === 1) {
      data.codigo = null;
      data.nome = row[0];
    }
    return data;
  });

  const result = CboModel.insertMany(items);
  return result;
};

exports.export = async (req, res) => {
  // TODO: stream pipe data https://stackoverflow.com/a/18045399
  return await CboModel.find();
};
