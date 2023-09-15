const mongoose = require("mongoose");
const id6 = require("../helpers/id6");

const {
  TIPO_GENERO,
  TIPO_CNH,
  TIPO_ESCOLARIDADE,
  FLUENCIA_LINGUAGEM,
  TIPO_QUESTAO,
  TIPO_MODELO_CONTRATO,
  TIPO_CONTRATO,
  TIPO_JORNADA,
} = require("../schemas/enums");
const tiposGenero = Object.values(TIPO_GENERO);
const tiposFluenciaLinguagem = Object.values(FLUENCIA_LINGUAGEM);
const tiposCNH = Object.values(TIPO_CNH);
const tiposEscolaridade = Object.values(TIPO_ESCOLARIDADE);
const tiposQuestao = Object.values(TIPO_QUESTAO);
const tiposContrato = Object.values(TIPO_CONTRATO);
const tiposModeloContrato = Object.values(TIPO_MODELO_CONTRATO);
const tiposJornada = Object.values(TIPO_JORNADA);

const VagaSchema = require("../schemas/vaga.schema");
const PJSchema = require("../schemas/pj.schema");
const PFSchema = require("../schemas/pf.schema");
const CBOSchema = require("../schemas/cbo.schema");
const HabilidadeSchema = require("../schemas/habilidade.schema");
const QualificacaoSchema = require("../schemas/qualificacao.schema");

const VagaModel = mongoose.model("Vaga", VagaSchema);
const PJModel = mongoose.model("PJ", PJSchema);
const PFModel = mongoose.model("PF", PFSchema);
const CBOModel = mongoose.model("CBO", CBOSchema);
const HabilidadeModel = mongoose.model("Habilidade", HabilidadeSchema);
const QualificacaoModel = mongoose.model("Qualificacao", QualificacaoSchema);

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
  generos: ["MASCULINO", "FEMININO"],
  tipoContrato: "CLT",
  modeloContrato: "HIBRIDO",
  diasPresencial: 2,
  jornada: "VESPERTINO",
  linguagens: [{ valor: "Portugues", tipo: "PROFICIENTE" }],
  beneficiosOferecidos: [{ valor: 300, nome: "Vale Alimentação" }],
  questoes: [{ titulo: "Questao 1", tipo: "TEXTO", isObrigatorio: true }],
  pcd: false,
  disponivelViagem: false,
  disponivelMudanca: false,
  ocultarEmpresa: false,
  analisePsicologo: false,
  endereco: {
    cep: "",
    pais: "",
    estado: "",
    cidade: "",
    bairro: "",
    rua: "",
    numero: "",
    complemento: "",
  }
};

exports.save = async (req, res) => {
  const data = {};

  if (req.body.active != null) data.active = !!req.body.active;

  if (req.body.titulo) data.titulo = req.body.titulo;
  if (req.body.apelido) data.apelido = req.body.apelido;
  if (req.body.descricao) data.descricao = req.body.descricao;
  if (req.body.experiencia) data.experiencia = req.body.experiencia;

  if (req.body.salarioMaximo && req.body.salarioMinimo && req.body.salarioMaximo <= req.body.salarioMinimo) {
    throw new Error(`Salário máximo "${req.body.salarioMaximo}" deve ser maior que Salário mínimo "${req.body.salarioMinimo}"`);
  }
  if (req.body.salarioMinimo) data.salarioMinimo = req.body.salarioMinimo;
  if (req.body.salarioMaximo) data.salarioMaximo = req.body.salarioMaximo;
  
  if (req.body.idadeMaxima && req.body.idadeMinima && req.body.idadeMaxima <= req.body.idadeMinima) {
    throw new Error(`Idade máxima "${req.body.idadeMaxima}" deve ser maior que Idade mínima "${req.body.idadeMinima}"`);
  }
  if (req.body.idadeMinima) data.idadeMinima = req.body.idadeMinima;
  if (req.body.idadeMaxima) data.idadeMaxima = req.body.idadeMaxima;

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
  if (req.body.genero) {
    if (!tiposGenero.includes(req.body.genero))
      throw new Error(`Gênero "${genero}" inválido`);
    data.genero = req.body.genero;
  }
  if (req.body.tipoContrato) {
    if (!tiposContrato.includes(req.body.tipoContrato))
      throw new Error(`Tipo de contrato "${req.body.tipoContrato}" inválido`);
    data.tipoContrato = req.body.tipoContrato;
  }
  if (req.body.modeloContrato) {
    if (!tiposModeloContrato.includes(req.body.modeloContrato))
      throw new Error(`Modelo de contrato "${req.body.modeloContrato}" inválido`);
    data.modeloContrato = req.body.modeloContrato;

    if (req.body.modeloContrato === TIPO_MODELO_CONTRATO.HIBRIDO) {
      if (!req.body.diasPresencial)
        throw new Error(
          `Quantidade de dias presenciais é obrigatória se o modelo de contrato for híbrido`
        );
      data.diasPresencial = req.body.diasPresencial;
    }
  }
  if (req.body.jornada) {
    if (!tiposJornada.includes(req.body.jornada))
      throw new Error(`Jornada "${req.body.jornada}" inválida`);
    data.jornada = req.body.jornada;
  }
  if (req.body.linguagens) {
    req.body.linguagens.forEach((linguagem, linguagemIdx) => {
      if (!tiposFluenciaLinguagem.includes(linguagem.tipo))
        throw new Error(
          `Fluencia de linguagem ${linguagemIdx + 1} "${linguagem}" inválida`
        );
    });
    data.linguagens = req.body.linguagens;
  }
  if (req.body.endereco) {
    const endereco = req.body.endereco;
    data.endereco = {};
    if (endereco.cep) data.endereco.cep = endereco.cep.replace(/[^0-9]/gi, '');
    if (endereco.pais) data.endereco.pais = endereco.pais;
    if (endereco.estado) data.endereco.estado = endereco.estado;
    if (endereco.cidade) data.endereco.cidade = endereco.cidade;
    if (endereco.bairro) data.endereco.bairro = endereco.bairro;
    if (endereco.rua) data.endereco.rua = endereco.rua;
    if (endereco.numero) data.endereco.numero = endereco.numero;
    if (endereco.complemento) data.endereco.complemento = endereco.complemento;
  }
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
      if (questao.minimo != null) dataQuestao.minimo = questao.minimo;
      if (questao.maximo != null) dataQuestao.maximo = questao.maximo;
      if (questao.escolhas) dataQuestao.escolhas = questao.escolhas
        .map(x => x?.value != null ? x.value : x)
        .filter(x => x);
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

  if (req.body.cargo?._id) {
    data.cargo = req.body.cargo._id;
  }
  if (req.body.qualificacoes && req.body.qualificacoes.length > 0) {
    data.qualificacoes = req.body.qualificacoes.map(x => x._id).filter(x => x);
  }
  if (req.body.habilidades) {
    data.habilidades = req.body.habilidades.map(x => x._id).filter(x => x);
  }


  if (req.params.id) {
    const vaga = await VagaModel.findById(req.params.id);
    if (vaga.ownerId !== req.usuario._id)
      throw new Error('Acesso negado ao alterar vaga criada por outrém');
      // throw new Error(`Acesso negado ao alterar vaga criada por outrém - vaga.ownerId: ${vaga.ownerId}, usuario._id: ${req.usuario._id}`);

    return await VagaModel.findByIdAndUpdate(req.params.id, data, {
      new: true,
      runValidators: true,
    });
  } else {
    data._id = id6();
    data.ownerId = req.usuario._id;
    data.active = true;
    return await VagaModel.create(data);
  }
};

exports.delete = async (req, res) => {
  const id = req.params.id;
  const vaga = await VagaModel.findById(id);
  if (!vaga) throw new Error("Vaga não encontrada");

  if (vaga.ownerId !== req.usuario._id)
    throw new Error("Acesso negado ao deletar vaga criada por outrém");
  await VagaModel.findByIdAndDelete(id);
  return {
    vaga: vaga,
    deleted: true,
  };
};

exports.show = async (req, res) => {
  const id = req.params.id;
  let vaga = await VagaModel.findById(id).lean();
  if (!vaga) throw new Error("Vaga não encontrada");

  if (vaga.cargo) {
    const cargoObj = await CBOModel.findById(vaga.cargo).lean();
    vaga.cargo = cargoObj
  }
  if (vaga.qualificacoes?.length > 0) {
    for (let i=0; i<vaga.qualificacoes.length; i++) {
      const qualificacoesObj = await QualificacaoModel.findById(vaga.qualificacoes[i]).lean();
      vaga.qualificacoes[i] = qualificacoesObj;
    }
  }
  if (vaga.habilidades?.length > 0) {
    for (let i=0; i<vaga.habilidades.length; i++) {
      const habilidadesObj = await HabilidadeModel.findById(vaga.habilidades[i]).lean();
      vaga.habilidades[i] = habilidadesObj;
    }
  }

  if (!vaga.ocultarEmpresa) {
    const empresa = await PJModel.findById(
      vaga.ownerId,
      "endereco nomeFantasia telefones links"
    );
    vaga = {
      ...vaga,
      empresa,
    };
  }

  //TODO: propostas

  return vaga;
};

exports.listMine = async (req, res) => {
  const { from = 0, to = 30, q, sort = "createdAt" } = req.query;

  let search = {
    ownerId: req.usuario._id,
  };
  if (q) search.titulo = { $regex: q, $options: "i" };

  //TODO: propostas

  const total = await VagaModel.countDocuments(search);
  let data = await VagaModel.find(
    search,
    "_id titulo descricao tipoContrato qualificacoes active"
  )
    .sort({ [sort]: -1 })
    .skip(from)
    .limit(to - from)
    .exec();
  data = data.map((vaga) => ({
    _id: vaga._id,
    titulo: vaga.titulo,
    tipoContrato: vaga.tipoContrato,
    qualificacoes: vaga.qualificacoes,
    active: vaga.active,
    desc: vaga.descricao.split(" ").slice(0, 30).join(" ").slice(0, 300),
  }));
  return {
    data,
    meta: {
      total,
      from,
      to,
      q,
      sort,
      search,
    },
  };
};

exports.list = async (req, res) => {
  const { from = 0, to = 30, q, sort = "createdAt" } = req.query;

  let search = { active: true };
  if (q) search.titulo = { $regex: q, $options: "i" };

  const total = await VagaModel.countDocuments(search);
  let data = await VagaModel.find(
    search,
    "_id titulo descricao tipoContrato qualificacoes"
  )
    .sort({ [sort]: -1 })
    .skip(from)
    .limit(to - from)
    .exec();
  data = data.map((vaga) => ({
    _id: vaga._id,
    titulo: vaga.titulo,
    tipoContrato: vaga.tipoContrato,
    qualificacoes: vaga.qualificacoes,
    desc: vaga.descricao.split(" ").slice(0, 30).join(" ").slice(0, 300),
  }));
  return {
    data,
    meta: {
      total,
      from,
      to,
      q,
      sort,
      search,
    },
  };
};

// exports.favoritar = async (req, res)

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
