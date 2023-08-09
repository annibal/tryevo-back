const mongoose = require("mongoose");
const id6 = require("../helpers/id6");
const HabilidadeSchema = require("../schemas/habilidade.schema");
const HabilidadeModel = mongoose.model("Habilidade", HabilidadeSchema);

exports.list = async (req, res) => {
  const { from = 0, to = 30, q } = req.query;

  let search = { };
  if (q) {
    search.nome = { $regex: q, $options: "i" };
  }

  const total = await HabilidadeModel.countDocuments(search);
  let data = await HabilidadeModel.find(search)
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
    valid: false,
  };
  return await HabilidadeModel.create(data);
};

exports.edit = async (req, res) => {
  const habilidade = await HabilidadeModel.findByIdAndUpdate(
    req.params.id,
    {
      nome: req.body.nome,
    },
    {
      new: true,
      runValidators: true,
    }
  );
  if (!habilidade) throw new Error('Habilidade Não encontradoa');
  
  return habilidade;
};

exports.delete = async (req, res) => {
  const habilidade = await HabilidadeModel.findByIdAndDelete(req.params.id);
  if (!habilidade) throw new Error('Habilidade Não encontradoa');
  return habilidade;
};

exports.doImport = async (req, res) => {
  if (!req.body.lista) throw new Error('Lista para importar habilidades não informada');

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

  const result = HabilidadeModel.insertMany(items);
  return result;
};
