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
  TIPO_PLANO_ASSINATURA,
  TIPO_FEATURE_PLANO_ASSINATURA: FEAT,
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
const PropostaSchema = require("../schemas/proposta.schema");
const UsuarioSchema = require("../schemas/usuario.schema");
const PJSchema = require("../schemas/pj.schema");
const PFSchema = require("../schemas/pf.schema");
const CBOSchema = require("../schemas/cbo.schema");
const HabilidadeSchema = require("../schemas/habilidade.schema");
const QualificacaoSchema = require("../schemas/qualificacao.schema");
const getMatchWords = require("../helpers/getMatchWords");
const { getSingleUser } = require("./auth.controller");

const VagaModel = mongoose.model("Vaga", VagaSchema);
const PropostaModel = mongoose.model("Proposta", PropostaSchema);
const UsuarioModel = mongoose.model("Usuario", UsuarioSchema);
const PJModel = mongoose.model("PJ", PJSchema);
const PFModel = mongoose.model("PF", PFSchema);
const CBOModel = mongoose.model("CBO", CBOSchema);
const HabilidadeModel = mongoose.model("Habilidade", HabilidadeSchema);
const QualificacaoModel = mongoose.model("Qualificacao", QualificacaoSchema);


const mapFilterVagaMatch = (arr) => (arr || []).map(x => {
  if (typeof x === "object" && x?._id != null) return x._id;
  if (typeof x === "string") return x;
  return null;
}).filter(x => x);

const getVagaMatch = (vaga, candidato) => {

  // Words
  const v_w = (vaga.descUnique == null ? getMatchWords(vaga.descricao || "") : vaga.descUnique).split(' ');
  const c_w = (vaga.resumoUnique == null ? getMatchWords(candidato?.resumo || "") : vaga.resumoUnique).split(' ');
  // const all_w = Array.from(new Set([...v_w, ...c_w]));
  const common_w = c_w.filter(w => v_w.includes(w));
  const match_w = common_w.length / v_w.length;

  // Habilidades
  const v_h = mapFilterVagaMatch(vaga.habilidades)
  const c_h = mapFilterVagaMatch(candidato?.habilidades);
  // const all_h = Array.from(new Set([...v_h, ...c_h]));
  const common_h = c_h.filter(h => v_h.includes(h));
  const match_h = common_h.length / v_h.length;

  // Qualificacoes
  const v_q = mapFilterVagaMatch(vaga.qualificacoes);
  const allQualif = (candidato?.experienciasProfissionais || []).map(x => mapFilterVagaMatch(x?.qualificacoes))
  const c_q = Array.from(new Set(allQualif.flat()));
  // const all_q = Array.from(new Set([...v_q, ...c_q]));
  const common_q = c_q.filter(q => v_q.includes(q));
  const match_q = common_q.length / v_q.length;

  let match = 0;
  let matchBase = 0;

  if (v_w.length > 0) {
    match += match_w * 1;
    matchBase += 1;
  }
  if (v_h.length > 0) {
    match += match_h * 3;
    matchBase += 3;
  }
  if (v_q.length > 0) {
    match += match_q * 2;
    matchBase += 2;
  }

  if (matchBase === 0) {
    match = null;
  } else {
    match = match / matchBase
  }

  return {
    match,
    matchDesc: {
      palavras: {
        vaga: v_w.length,
        candidato: c_w.length,
        comuns: common_w.length,
        base: 1,
        match: match_w,
        v_w,
        c_w,
        common_w,
      },
      habilidades: {
        vaga: v_h.length,
        candidato: c_h.length,
        comuns: common_h.length,
        base: 3,
        match: match_h,
        v_h,
        c_h,
        common_h,
      },
      qualificacoes: {
        vaga: v_q.length,
        candidato: c_q.length,
        comuns: common_q.length,
        base: 2,
        match: match_q,
        v_q,
        c_q,
        common_q,
      },
    }
  }
}
exports.getVagaMatch = getVagaMatch


exports.save = async (req, res) => {
  const data = {};

  if (req.body.active != null) data.active = !!req.body.active;

  if (req.body.titulo) data.titulo = req.body.titulo;
  if (req.body.apelido) data.apelido = req.body.apelido;
  if (req.body.descricao) {
    data.descricao = req.body.descricao;
    data.descUnique = getMatchWords(req.body.descricao);
    if (!data.descUnique) {
      throw new Error("Descrição da vaga precisa ser um pouco mais longa")
    }
  }

  if (req.body.experiencia) data.experiencia = req.body.experiencia;

  if (
    req.body.salarioMaximo &&
    req.body.salarioMinimo &&
    req.body.salarioMaximo <= req.body.salarioMinimo
  ) {
    throw new Error(
      `Salário máximo "${req.body.salarioMaximo}" deve ser maior que Salário mínimo "${req.body.salarioMinimo}"`
    );
  }
  if (req.body.salarioMinimo) data.salarioMinimo = req.body.salarioMinimo;
  if (req.body.salarioMaximo) data.salarioMaximo = req.body.salarioMaximo;

  if (
    req.body.idadeMaxima &&
    req.body.idadeMinima &&
    req.body.idadeMaxima <= req.body.idadeMinima
  ) {
    throw new Error(
      `Idade máxima "${req.body.idadeMaxima}" deve ser maior que Idade mínima "${req.body.idadeMinima}"`
    );
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
      throw new Error(
        `Modelo de contrato "${req.body.modeloContrato}" inválido`
      );
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
    if (endereco.cep) data.endereco.cep = endereco.cep.replace(/[^0-9]/gi, "");
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
      if (questao.escolhas)
        dataQuestao.escolhas = questao.escolhas
          .map((x) => (x?.value != null ? x.value : x))
          .filter((x) => x);
      if (questao.isObrigatorio)
        dataQuestao.isObrigatorio = !!questao.isObrigatorio;
      data.questoes.push(dataQuestao);
    });
  }

  data.pcd = !!req.body.pcd;
  data.disponivelViagem = !!req.body.disponivelViagem;
  data.disponivelMudanca = !!req.body.disponivelMudanca;
  data.ocultarEmpresa = !!req.body.ocultarEmpresa;
  data.analisePsicologo = !!req.body.analisePsicologo;
  
  data.integrarLinkedin = !!req.body.integrarLinkedin;
  if (req.body.integrarLinkedin) {
    if (req.body.integrarLinkedinConfig) {
      data.integrarLinkedinConfig = req.body.integrarLinkedinConfig;
    }
  } else {
    data.integrarLinkedinConfig = '';
  }
  data.integrarCatho = !!req.body.integrarCatho;
  if (req.body.integrarCatho) {
    if (req.body.integrarCathoConfig) {
      data.integrarCathoConfig = req.body.integrarCathoConfig;
    }
  } else {
    data.integrarCathoConfig = '';
  }
  data.integrarCurriculos = !!req.body.integrarCurriculos;
  if (req.body.integrarCurriculos) {
    if (req.body.integrarCurriculosConfig) {
      data.integrarCurriculosConfig = req.body.integrarCurriculosConfig;
    }
  } else {
    data.integrarCurriculosConfig = '';
  }
  data.integrarInfojobs = !!req.body.integrarInfojobs;
  if (req.body.integrarInfojobs) {
    if (req.body.integrarInfojobsConfig) {
      data.integrarInfojobsConfig = req.body.integrarInfojobsConfig;
    }
  } else {
    data.integrarInfojobsConfig = '';
  }
  
  if (req.body.cargo?._id) {
    data.cargo = req.body.cargo._id;
  }
  if (req.body.qualificacoes && req.body.qualificacoes.length > 0) {
    data.qualificacoes = req.body.qualificacoes
      .map((x) => x._id)
      .filter((x) => x);
  }
  if (req.body.habilidades) {
    data.habilidades = req.body.habilidades.map((x) => x._id).filter((x) => x);
  }

  if (req.params.id) {
    const vaga = await VagaModel.findById(req.params.id);
    if (vaga.ownerId !== req.usuario._id && !req.usuario.isMasterAdmin)
      throw new Error("Acesso negado ao alterar vaga criada por outrém");
    // throw new Error(`Acesso negado ao alterar vaga criada por outrém - vaga.ownerId: ${vaga.ownerId}, usuario._id: ${req.usuario._id}`);

    if (vaga.contratou && !req.usuario.isMasterAdmin)
      throw new Error("Não é permitido fazer alterações em uma vaga que já contratou um candidato");

    return await VagaModel.findByIdAndUpdate(req.params.id, data, {
      new: true,
      runValidators: true,
    });
  } else {

    const maxVagas = req.usuario.plano?.features[FEAT.LIMITE_VAGAS]
    if (maxVagas) {
      const countVagasCriadas = await VagaModel.countDocuments({
        contratou: null,
        ownerId: req.usuario._id,
      });
      if (countVagasCriadas >= maxVagas) {
        throw new Error(`Falha ao criar vaga: limite máximo de ${maxVagas} vagas atingido`)
      }
    }

    data._id = id6();
    data.ownerId = req.usuario._id;
    data.active = true;
    return await VagaModel.create(data);
  }
};

exports.getCountMyVagasCriadas = async (req, res) => {
  return await VagaModel.countDocuments({
    contratou: null,
    ownerId: req.usuario._id,
  });
}

exports.delete = async (req, res) => {
  const id = req.params.id;
  const vaga = await VagaModel.findById(id);
  if (!vaga) throw new Error("Vaga não encontrada");

  if (vaga.ownerId !== req.usuario._id)
    throw new Error("Acesso negado ao deletar vaga criada por outrém");
  if (vaga.contratou)
    throw new Error("Não é permitido deletar vaga que já contratou um candidato");
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
  
  // Update vagas that didn't have descUnique
  if (!vaga.descUnique && vaga.descricao) {
    try {
      vaga.descUnique = getMatchWords(vaga.descricao);
      await VagaModel.findByIdAndUpdate(req.params.id, vaga, {
        new: true,
        runValidators: true,
      });
  
      vaga = await VagaModel.findById(id).lean();
    } catch (e) {}
  }

  vaga.propostas = await PropostaModel.find({ vagaId: id });

  if (vaga.cargo) {
    const cargoObj = await CBOModel.findById(vaga.cargo).lean();
    vaga.cargo = cargoObj;
  }
  if (vaga.qualificacoes?.length > 0) {
    for (let i = 0; i < vaga.qualificacoes.length; i++) {
      const qualificacoesObj = await QualificacaoModel.findById(
        vaga.qualificacoes[i]
      ).lean();
      vaga.qualificacoes[i] = qualificacoesObj;
    }
  }
  if (vaga.habilidades?.length > 0) {
    for (let i = 0; i < vaga.habilidades.length; i++) {
      const habilidadesObj = await HabilidadeModel.findById(
        vaga.habilidades[i]
      ).lean();
      vaga.habilidades[i] = habilidadesObj;
    }
  }

  if (req.usuario && !req.usuario.isMasterAdmin) {
    const candidato = await PFModel.findById(req.usuario._id).lean();
    const matchObj = getVagaMatch(vaga, candidato)
    vaga.match = matchObj.match;
    vaga.matchDesc = matchObj.matchDesc;
  }

  let showEmpresa = true;
  if (vaga.ocultarEmpresa) showEmpresa = false;
  if (!req.usuario.plano?.features[FEAT.VER_NOME_EMPRESA]) showEmpresa = false;
  if (req.usuario.isMasterAdmin) showEmpresa = true;

  if (showEmpresa) {
    const empresa = await PJModel.findById(
      vaga.ownerId,
      "endereco nomeFantasia telefones links"
    );
    vaga = {
      ...vaga,
      empresa,
    };
  }
  
  if (req.usuario.isMasterAdmin) {
    vaga.owner = await getSingleUser({
      ...req,
      params: {
        ...req.params,
        id: vaga.ownerId,
      }
    });
  }

  return vaga;
};

exports.listMine = async (req, res) => {
  const { from = 0, to = 50, q, sort = "createdAt" } = req.query;

  let search = {
    ownerId: req.usuario._id,
  };
  if (q) search.titulo = { $regex: q, $options: "i" };

  const select = [
    "_id",
    "titulo",
    "apelido",
    "cargo",
    "active",
    "descricao",
    "tipoContrato",
    "qualificacoes",
    "habilidades",
    "contratou",
  ];

  const total = await VagaModel.countDocuments(search);
  let data = await VagaModel.find(search, select.join(" "))
    .sort({ [sort]: -1 })
    .skip(from)
    .limit(to - from)
    .exec();

  const cargos = data.map((vaga) => vaga.cargo).filter((x) => x);
  let objCargos = [];

  if (cargos.length > 0) {
    objCargos = await CBOModel.find({
      _id: { $in: cargos },
    }).lean();
  }

  data = data.map((vaga) => {
    const obj = select.reduce(
      (all, curr) => ({
        ...all,
        [curr]: vaga[curr],
      }),
      {}
    );
    obj.desc = vaga.descricao.split(" ").slice(0, 30).join(" ").slice(0, 300);

    if (vaga.cargo) {
      const objCargo = objCargos.find((x) => x._id === vaga.cargo);
      if (objCargo) {
        obj.cargo = objCargo.nome;
      }
    }

    obj.contratou = !!vaga.contratou;

    return obj;
  });

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

exports.listSalvadas = async (req, res) => {
  const { _id, plano } = req.usuario || {};
  if (plano?.tipo !== TIPO_PLANO_ASSINATURA.PF) {
    throw new Error("Usuário não é PF");
  }

  if (!_id) throw new Error("Usuário não encontrado na sessão");

  const pfObj = await PFModel.findById(_id).lean();
  if (!pfObj) throw new Error("Usuário não encontrado");

  const reqX = {
    ...req,
    query: {
      ...req.query,
      id: (pfObj.vagasSalvas || []).join(',') + ',',
    },
  };

  return await this.list(reqX, res);
};

exports.list = async (req, res) => {
  const { from = 0, to = 30, q, sort = "createdAt" } = req.query;
  
  let search = {};
  
  if (!req.query.showAll) search.active = true;
  if (q) search.titulo = { $regex: q, $options: "i" };
  if (req.query.descricao) { search.descricao = { $regex: req.query.descricao, $options: "i" }; }
  if (req.query.ownerId) { search.ownerId = req.query.ownerId; }
  if (req.query.tipoContrato && tiposContrato.includes(req.query.tipoContrato)) { search.tipoContrato = req.query.tipoContrato; }
  if (req.query.modeloContrato && tiposModeloContrato.includes(req.query.modeloContrato)) { search.modeloContrato = req.query.modeloContrato; }
  if (req.query.jornada && tiposJornada.includes(req.query.jornada)) { search.jornada = req.query.jornada; }
  if (req.query.salarioMinimo && !isNaN(+req.query.salarioMinimo)) { search.salarioMinimo = { $gte: +req.query.salarioMinimo }; }
  if (req.query.salarioMaximo && !isNaN(+req.query.salarioMaximo)) { search.salarioMaximo = { $lte: +req.query.salarioMaximo }; }
  if (req.query.idadeMinima && !isNaN(+req.query.idadeMinima)) { search.idadeMinima = { $gte: +req.query.idadeMinima }; }
  if (req.query.idadeMaxima && !isNaN(+req.query.idadeMaxima)) { search.idadeMaxima = { $lte: +req.query.idadeMaxima }; }
  if (req.query.habilidades) { search.habilidades = { $in: req.query.habilidades.split(',').map(x => x.trim()) }; }
  if (req.query.qualificacoes) { search.qualificacoes = { $in: req.query.qualificacoes.split(',').map(x => x.trim()) }; }
  if (req.query.id) search._id = { $in: req.query.id.split(',').map(x => x.trim()) };
  
  // console.log("\n\n\n\n", {search}, "\n\n\n\n")

  const select = [
    "_id",
    "createdAt",
    "titulo",
    "cargo",
    "active",
    "descricao",
    "tipoContrato",
    "qualificacoes",
    "habilidades",
    "endereco",
    "ocultarEmpresa",
    "ownerId",
    "contratou",
  ];

  const total = await VagaModel.countDocuments(search);
  let data = await VagaModel.find(search, select.join(" "))
    .sort({ [sort]: -1 })
    .skip(from)
    .limit(to - from)
    .exec();

  const cargos = Array.from(
    new Set(data.map((vaga) => vaga.cargo).filter((x) => x))
  );
  let objCargos = [];
  if (cargos.length > 0) {
    objCargos = await CBOModel.find({
      _id: { $in: cargos },
    }).lean();
  }

  const empresas = Array.from(
    new Set(
      data
        .map((vaga) => {
          if (req.usuario.isMasterAdmin) return vaga.ownerId;
          if (!vaga.ocultarEmpresa) return vaga.ownerId;
          return null;
        })
        .filter((x) => x)
    )
  );
  let objEmpresas = [];
  if (empresas.length > 0) {
    objEmpresas = await PJModel.find({
      _id: { $in: empresas },
    }).lean();
  }
  let objOwners = [];
  if (empresas.length > 0 && req.usuario.isMasterAdmin) {
    objOwners = await UsuarioModel.find({
      _id: { $in: empresas },
    }).lean();
  }

  const habilidades = Array.from(
    new Set(
      data
        .map((vaga) => vaga.habilidades)
        .flat()
        .filter((x) => x)
    )
  );
  let objHabilidades = [];
  if (habilidades.length > 0) {
    objHabilidades = await HabilidadeModel.find({
      _id: { $in: habilidades },
    }).lean();
  }
  const qualificacoes = Array.from(
    new Set(
      data
        .map((vaga) => vaga.qualificacoes)
        .flat()
        .filter((x) => x)
    )
  );
  let objQualificacoes = [];
  if (qualificacoes.length > 0) {
    objQualificacoes = await QualificacaoModel.find({
      _id: { $in: qualificacoes },
    }).lean();
  }

  data = data.map((vaga) => {
    const obj = select.reduce(
      (all, curr) => ({
        ...all,
        [curr]: vaga[curr],
      }),
      {}
    );
    obj.desc = vaga.descricao.split(" ").slice(0, 30).join(" ").slice(0, 300);
    delete obj.descricao;

    if (vaga.cargo) {
      const objCargo = objCargos.find((x) => x._id === vaga.cargo);
      if (objCargo) {
        obj.cargo = {
          _id: objCargo._id,
          nome: objCargo.nome,
        };
      }
    }

    let showEmpresa = true;
    if (vaga.ocultarEmpresa) showEmpresa = false;
    if (!req.usuario.plano?.features[FEAT.VER_NOME_EMPRESA]) showEmpresa = false;
    if (req.usuario.isMasterAdmin) showEmpresa = true;  
    if (showEmpresa) {
      const objEmpresa = objEmpresas.find((x) => x._id === vaga.ownerId);
      if (objEmpresa) {
        obj.empresa = {
          _id: objEmpresa._id,
          nome: objEmpresa.nomeFantasia,
        };
      }
      if (req.usuario.isMasterAdmin) {
        const objOwner = objOwners.find((x) => x._id === vaga.ownerId);
        obj.owner = {
          _id: objOwner._id,
          plano: objOwner.plano,
          email: objOwner.email,
        };
      }
    }

    if (vaga.habilidades) {
      obj.habilidades = vaga.habilidades
        .map((habilidade) => {
          const objHabilidade = objHabilidades.find(
            (x) => x._id === habilidade
          );
          if (objHabilidade) {
            return {
              _id: objHabilidade._id,
              nome: objHabilidade.nome,
            };
          }
        })
        .filter((x) => x);
    }
    if (vaga.qualificacoes) {
      obj.qualificacoes = vaga.qualificacoes
        .map((qualificacao) => {
          const objQualificacao = objQualificacoes.find(
            (x) => x._id === qualificacao
          );
          if (objQualificacao) {
            return {
              _id: objQualificacao._id,
              nome: objQualificacao.nome,
            };
          }
        })
        .filter((x) => x);
    }

    obj.contratou = !!obj.contratou;

    return obj;
  });

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
