const mongoose = require("mongoose");
const id6 = require("../helpers/id6");

const {
  TIPO_GENERO,
  TIPO_CNH,
  TIPO_ESCOLARIDADE,
  FLUENCIA_LINGUAGEM,
  TIPO_QUESTAO,
} = require("../schemas/enums");
const tiposGenero = Object.values(TIPO_GENERO);
const tiposFluenciaLinguagem = Object.values(FLUENCIA_LINGUAGEM);
const tiposCNH = Object.values(TIPO_CNH);
const tiposEscolaridade = Object.values(TIPO_ESCOLARIDADE);
const tiposQuestao = Object.values(TIPO_QUESTAO);

const VagaSchema = require("../schemas/vaga.schema");
const PJSchema = require("../schemas/pj.schema");
const VagaModel = mongoose.model("Vaga", VagaSchema);
const PJModel = mongoose.model("PJ", PJSchema);

const exemplo_vaga = {
  titulo: "String",
  descricao: "String",
  experiencia: 1,
  salarioMinimo: 1,
  salarioMaximo: 1,
  idadeMinima: 1,
  idadeMaxima: 1,
  testes: ["teste1", "teste2"],
  qualificacoes: ["string"],
  categoriaCNH: "NONE",
  escolaridade: "FUNDAMENTAL",
  beneficiosOferecidos: [{ valor: 300, tipo: "Vale Alimentação" }],
  questoes: [{ titulo: "Questao 1", tipo: "TEXTO", isObrigatorio: true }],
  pcd: false,
  disponivelViagem: false,
  disponivelMudanca: false,
  ocultarEmpresa: false,
  analisePsicologo: false,
};

exports.save = async (req, res) => {
  const data = {};

  if (req.body.titulo) data.titulo = req.body.titulo;
  if (req.body.descricao) data.descricao = req.body.descricao;
  if (req.body.experiencia) data.experiencia = req.body.experiencia;
  if (req.body.salarioMinimo) data.salarioMinimo = req.body.salarioMinimo;
  if (req.body.salarioMaximo) data.salarioMaximo = req.body.salarioMaximo;
  if (req.body.idadeMinima) data.idadeMinima = req.body.idadeMinima;
  if (req.body.idadeMaxima) data.idadeMaxima = req.body.idadeMaxima;
  if (req.body.tipoContrato) data.tipoContrato = req.body.tipoContrato;
  if (req.body.modeloContrato) data.modeloContrato = req.body.modeloContrato;
  if (req.body.jornada) data.jornada = req.body.jornada;

  if (req.body.qualificacoes) data.qualificacoes = req.body.qualificacoes;

  if (req.body.categoriaCNH) {
    if (!tiposCNH.includes(req.body.categoriaCNH))
      throw new Error("Categoria CNH inválida");
    data.categoriaCNH = req.body.categoriaCNH;
  }
  if (req.body.escolaridade) {
    if (!tiposEscolaridade.includes(req.body.escolaridade))
      throw new Error("Escolaridade inválida");
    data.escolaridade = req.body.escolaridade;
  }
  // if (req.body.generos)
  // if (req.body.linguagens)
  // if (req.body.endeceo)
  if (req.body.beneficiosOferecidos)
    data.beneficiosOferecidos = req.body.beneficiosOferecidos;

  if (req.body.questoes) {
    data.questoes = [];
    req.body.questoes.forEach((questao) => {
      const dataQuestao = {};
      if (questao.titulo) dataQuestao.titulo = questao.titulo;
      if (questao.tipo) {
        if (!tiposQuestao.includes(questao.tipo))
          throw new Error("Tipo de questão inválido");
        dataQuestao.tipo = questao.tipo;
      }
      if (questao.isObrigatorio)
        dataQuestao.isObrigatorio = !!questao.isObrigatorio;
      data.questoes.push(dataQuestao);
    });
  }

  if (req.body.pcd) data.pcd = !!req.body.pcd;
  if (req.body.disponivelViagem)
    data.disponivelViagem = !!req.body.disponivelViagem;
  if (req.body.disponivelMudanca)
    data.disponivelMudanca = !!req.body.disponivelMudanca;
  if (req.body.ocultarEmpresa) data.ocultarEmpresa = !!req.body.ocultarEmpresa;
  if (req.body.analisePsicologo)
    data.analisePsicologo = !!req.body.analisePsicologo;

  if (req.body._id) {
    const vaga = VagaModel.findById(req.body._id);
    if (vaga.ownerId !== req.usuario._id) throw new Error("Acesso negado ao alterar vaga criada por outrém");
    
    return await VagaModel.findByIdAndUpdate(req.body._id, data, {
      new: true,
      runValidators: true,
    });
  } else {
    data._id = id6();
    data.ownerId = req.usuario._id;
    return await VagaModel.create(data);
  }
};

exports.delete = async (req, res) => {
  const id = req.params.id;
  const vaga = await VagaModel.findById(id);
  if (!vaga) throw new Error("Vaga não encontrada");

  if (vaga.ownerId !== req.usuario._id) throw new Error("Acesso negado ao deletar vaga criada por outrém");
  await VagaModel.findByIdAndDelete(id)
  return {
    vaga: vaga,
    deleted: true,
  };
};

exports.show = async (req, res) => {
  const id = req.params.id;
  let vaga = await VagaModel.findById(id);
  if (!vaga) throw new Error("Vaga não encontrada");

  if (!vaga.ocultarEmpresa) {
    const empresa = await PJModel.findById(vaga.ownerId, "endereco nomeFantasia telefones links")
    vaga = {
      ...vaga.toJSON(),
      empresa,
    }
  }

  // propostas
  
  return vaga
}

exports.list = async (req, res) => {
  const { from = 0, to = 30, q, sort = "createdAt" } = req.query;

  let search = {};
  if (q) search.titulo = { $regex: q, $options: "i" };

  const total = await VagaModel.countDocuments(search);
  let data = await VagaModel.find(search, '_id titulo descricao tipoContrato qualificacoes')
    .sort({ [sort]: -1 })
    .skip(from)
    .limit(to - from)
    .exec();
  data = data.map((vaga) => ({
    _id: vaga._id,
    titulo: vaga.titulo,
    tipoContrato: vaga.tipoContrato,
    qualificacoes: vaga.qualificacoes,
    desc: vaga.descricao.split(' ').slice(0, 30).join(' ').slice(0, 300),
  }))
  return {
    total,
    data,
    meta: {
      from,
      to,
      q,
      sort,
      search,
    },
  };
};

// const pageSize = 100;
// const pageNumber = 1;
// const data = await MyModel
//   .find(search) // { name: { $regex: "partia", $options: "i" } })
//   .sort({ createdAt: -1 })
//   .skip(pageSize * (pageNumber - 1))
//   .limit(pageSize)
//   .exec((error, items) => {
//     if (error) throw new Error(error);
//     MyModel.countDocuments().exec((countError, count) => {
//       if (countError) {
//         throw new Error(countError);
//       }
//       return {
//         data,
//         total: Math.ceil(count / pageSize),
//         current: pageNumber,
//       };
//     });
//   });
