const mongoose = require("mongoose");

const {
  TIPO_TELEFONE,
  TIPO_DOCUMENTO,
  TIPO_LINK,
  FLUENCIA_LINGUAGEM,
  TIPO_ESCOLARIDADE,
  TIPO_GENERO,
  TIPO_ESTADO_CIVIL,
} = require("../schemas/enums");

const tiposTelefone = Object.values(TIPO_TELEFONE);
const tiposDocumento = Object.values(TIPO_DOCUMENTO);
const tiposLink = Object.values(TIPO_LINK);
const tiposFluenciaLinguagem = Object.values(FLUENCIA_LINGUAGEM);
const tiposEscolaridade = Object.values(TIPO_ESCOLARIDADE);
const tiposGenero = Object.values(TIPO_GENERO);
const tiposEstadoCivil = Object.values(TIPO_ESTADO_CIVIL);

// const UsuarioSchema = require("../schemas/usuario.schema");
// const ManySchema = require("../schemas/many.schema");
// const ProjetosPessoaisSchema = require("../schemas/projetos-pessoais.schema");
// const EscolaridadeSchema = require("../schemas/escolaridade.schema");
// const ExperienciaProfissionalSchema = require("../schemas/experiencia-profissional.schema");
// const EnderecoSchema = require("../schemas/endereco.schema");
// const QualificacaoSchema = require("../schemas/qualificacao.schema");
const PFSchema = require("../schemas/pf.schema");
const PJSchema = require("../schemas/pj.schema");
const validateDocumento = require("../helpers/validateDocumento");

const PFModel = mongoose.model("PF", PFSchema);
const PJModel = mongoose.model("PJ", PJSchema);

exports.getSelf = async (req, res) => {
  const { _id, plano } = req.usuario || {};
  if (!_id) throw new Error("Usuário não encontrado na sessão");
  if (plano.startsWith("PJ")) {
    const dados = await PJModel.findById(_id);
    return dados;
  } else {
    const dados = await PFModel.findById(_id);
    return dados;
  }
};

const example_pf = {
  nomePrimeiro: "",
  nomeUltimo: "",
  nomePreferido: "",
  genero: "",
  estadoCivil: "",
  nacionalidade: "",
  nascimento: "date",
  isAleijado: false,
  aceitaTrabalharDistancia: 123,
  aceitaMudarDistancia: 123,
  isPsiquiatra: false,
  endereco: {
    cep: "",
    pais: "",
    estado: "",
    cidade: "",
    bairro: "",
    rua: "",
    numero: "",
    complemento: "",
  },
  telefones: [
    {
      valor: "",
      descricao: "",
      tipo: "",
      isPrimario: false,
    },
  ],
  links: [
    {
      valor: "",
      descricao: "",
      tipo: "",
      isPrimario: false,
    },
  ],
  documentos: [
    {
      valor: "",
      descricao: "",
      tipo: "",
      isPrimario: false,
    },
  ],
  qualificacoes: [""],
  linguagens: [
    {
      valor: "",
      descricao: "",
      tipo: "",
      isPrimario: false,
    },
  ],
  projetosPessoais: [
    {
      titulo: "",
      url: "",
      descricao: "",
      quando: "",
    },
  ],
  escolaridades: [
    {
      nome: "",
      nivel: "",
      isCompleto: "",
      inicio: "",
      fim: "",
    },
  ],
  experienciasProfissionais: [
    {
      cargo: "",
      empresa: "",
      descricao: "",
      inicio: "",
      fim: "",
      isAtual: "",
      qualificacoes: "",
    },
  ],
};

exports.postPF = async (req, res) => {
  const { _id, plano } = req.usuario || {};
  if (!_id) throw new Error("Usuário não encontrado na sessão");
  if (!plano.startsWith("PF")) throw new Error("Usuário não é PF");

  const data = { _id };
  if (req.body.nomePrimeiro) data.nomePrimeiro = req.body.nomePrimeiro;
  if (req.body.nomeUltimo) data.nomeUltimo = req.body.nomeUltimo;
  if (req.body.nomePreferido) data.nomePreferido = req.body.nomePreferido;
  if (req.body.nacionalidade) data.nacionalidade = req.body.nacionalidade;
  if (req.body.nascimento) data.nascimento = req.body.nascimento;
  if (req.body.isAleijado) data.isAleijado = !!req.body.isAleijado;
  if (req.body.aceitaTrabalharDistancia)
    data.aceitaTrabalharDistancia = Math.floor(
      req.body.aceitaTrabalharDistancia
    );
  if (req.body.aceitaMudarDistancia)
    data.aceitaMudarDistancia = Math.floor(req.body.aceitaMudarDistancia);
  if (req.body.isPsiquiatra) data.isPsiquiatra = !!req.body.isPsiquiatra;
  if (req.body.genero) {
    if (!tiposGenero.includes(req.body.genero))
      throw new Error(`Tipo de gênero inválido "${req.body.genero}`);
    data.genero = req.body.genero;
  }
  if (req.body.estadoCivil) {
    if (!tiposEstadoCivil.includes(req.body.estadoCivil))
      throw new Error(`Tipo de estado civil inválido "${req.body.estadoCivil}`);
    data.estadoCivil = req.body.estadoCivil;
  }

  if (req.body.endereco) {
    const endereco = req.body.endereco;
    data.endereco = {};
    if (endereco.cep) data.endereco.cep = endereco.cep;
    if (endereco.pais) data.endereco.pais = endereco.pais;
    if (endereco.estado) data.endereco.estado = endereco.estado;
    if (endereco.cidade) data.endereco.cidade = endereco.cidade;
    if (endereco.bairro) data.endereco.bairro = endereco.bairro;
    if (endereco.rua) data.endereco.rua = endereco.rua;
    if (endereco.numero) data.endereco.numero = endereco.numero;
    if (endereco.complemento) data.endereco.complemento = endereco.complemento;
  }

  if (req.body.telefones) {
    data.telefones = [];
    if (req.body.telefones.length > 0) {
      req.body.telefones.forEach((telefone) => {
        if (!tiposTelefone.includes(telefone.tipo))
          throw new Error(`Tipo de telefone inválido "${telefone.tipo}"`);
        if (telefone.valor?.length < 8)
          throw new Error(`Telefone inválido "${telefone.valor}"`);
        const dataTelefone = {
          valor: telefone.valor,
          tipo: telefone.tipo,
        };
        if (telefone.descricao) dataTelefone.descricao = telefone.descricao;
        if (telefone.isPrimario) dataTelefone.isPrimario = telefone.isPrimario;
        data.telefones.push(dataTelefone);
      });
    }
  }

  if (req.body.links) {
    data.links = [];
    if (req.body.links.length > 0) {
      req.body.links.forEach((link) => {
        if (!tiposLink.includes(link.tipo))
          throw new Error(`Tipo de link inválido "${link.tipo}"`);
        if (link.valor?.length < 5)
          throw new Error(`Link inválido "${link.valor}"`);
        const dataLink = {
          valor: link.valor,
          tipo: link.tipo,
        };
        if (link.descricao) dataLink.descricao = link.descricao;
        if (link.isPrimario) dataLink.isPrimario = link.isPrimario;
        data.links.push(dataLink);
      });
    }
  }

  if (req.body.documentos) {
    data.documentos = [];
    if (req.body.documentos.length > 0) {
      req.body.documentos.forEach((documento) => {
        if (!tiposDocumento.includes(documento.tipo))
          throw new Error(`Tipo de documento inválido "${documento.tipo}"`);
        if (!validateDocumento(documento.valor, documento.tipo))
          throw new Error(`Documento inválido "${documento.valor}"`);
        const dataDocumento = {
          valor: documento.valor,
          tipo: documento.tipo,
        };
        data.documentos.push(dataDocumento);
      });
    }
  }

  if (req.body.linguagens) {
    data.linguagens = [];
    if (req.body.linguagens.length > 0) {
      req.body.linguagens.forEach((linguagem) => {
        if (!tiposFluenciaLinguagem.includes(linguagem.tipo))
          throw new Error(
            `Tipo de fluencia de linguagem inválido "${linguagem.tipo}"`
          );
        if (linguagem.valor?.length < 4)
          throw new Error(`Linguagem inválida "${linguagem.valor}"`);
        const dataLinguagem = {
          valor: linguagem.valor,
          tipo: linguagem.tipo,
        };
        data.linguagens.push(dataLinguagem);
      });
    }
  }

  if (req.body.projetosPessoais) {
    data.projetosPessoais = [];
    if (req.body.projetosPessoais.length > 0) {
      req.body.projetosPessoais.forEach((projetoPessoal) => {
        const dataProjetoPessoal = {};
        if (projetoPessoal.titulo)
          dataProjetoPessoal.titulo = projetoPessoal.titulo;
        if (projetoPessoal.url) dataProjetoPessoal.url = projetoPessoal.url;
        if (projetoPessoal.descricao)
          dataProjetoPessoal.descricao = projetoPessoal.descricao;
        if (projetoPessoal.quando)
          dataProjetoPessoal.quando = projetoPessoal.quando;
        data.projetosPessoais.push(dataProjetoPessoal);
      });
    }
  }

  if (req.body.escolaridades) {
    data.escolaridades = [];
    if (req.body.escolaridades.length > 0) {
      req.body.escolaridades.forEach((escolaridade) => {
        const dataEscolaridade = {};
        if (!escolaridade.fim && !escolaridade.isCompleto)
          throw new Error("Escolaridade deve ter um fim ou estar completa");
        if (escolaridade.fim && escolaridade.isCompleto)
          throw new Error("Escolaridade deve ou ter um fim ou estar completa");
        if (
          escolaridade.inicio &&
          escolaridade.fim &&
          new Date(escolaridade.inicio) >= new Date(escolaridade.fim)
        )
          throw new Error("Fim da Escolaridade deve ser antes do inicio");
        if (escolaridade.nivel) {
          if (!tiposEscolaridade.includes(escolaridade.nivel))
            throw new Error(
              `Tipo de escolaridade inválido "${escolaridade.nivel}"`
            );
          dataEscolaridade.nivel = escolaridade.nivel;
        }
        if (escolaridade.isCompleto)
          dataEscolaridade.isCompleto = !!escolaridade.isCompleto;
        if (escolaridade.nome) dataEscolaridade.nome = escolaridade.nome;
        if (escolaridade.inicio) dataEscolaridade.inicio = escolaridade.inicio;
        if (escolaridade.fim) dataEscolaridade.fim = escolaridade.inicio;
        data.escolaridades.push(dataEscolaridade);
      });
    }
  }

  if (req.body.experienciasProfissionais) {
    data.experienciasProfissionais = [];
    if (req.body.experienciasProfissionais.length > 0) {
      req.body.experienciasProfissionais.forEach((experienciaProfissional) => {
        const dataExperienciaProfissional = {};
        if (!experienciaProfissional.fim && !experienciaProfissional.isAtual)
          throw new Error(
            "Experiência Profissional deve ter um fim ou ser atual"
          );
        if (experienciaProfissional.fim && experienciaProfissional.isAtual)
          throw new Error(
            "Experiência Profissional deve ou ter um fim ou ser atual"
          );
        if (
          experienciaProfissional.inicio &&
          experienciaProfissional.fim &&
          new Date(experienciaProfissional.inicio) >=
            new Date(experienciaProfissional.fim)
        )
          throw new Error(
            "Fim da Experiência Profissional deve ser antes do inicio"
          );
        if (experienciaProfissional.cargo)
          dataExperienciaProfissional.cargo = experienciaProfissional.cargo;
        if (experienciaProfissional.empresa)
          dataExperienciaProfissional.empresa = experienciaProfissional.empresa;
        if (experienciaProfissional.descricao)
          dataExperienciaProfissional.descricao =
            experienciaProfissional.descricao;
        if (experienciaProfissional.inicio)
          dataExperienciaProfissional.inicio = experienciaProfissional.inicio;
        if (experienciaProfissional.fim)
          dataExperienciaProfissional.fim = experienciaProfissional.fim;
        if (experienciaProfissional.isAtual)
          dataExperienciaProfissional.isAtual = experienciaProfissional.isAtual;
        if (experienciaProfissional.qualificacoes)
          dataExperienciaProfissional.qualificacoes =
            experienciaProfissional.qualificacoes;
        data.experienciasProfissionais.push(dataExperienciaProfissional);
      });
    }
  }

  if (req.body.qualificacoes) {
    data.qualificacoes = req.body.qualificacoes;
  }

  let info;
  const existsObj = await PFModel.findById(_id);
  console.log(data);
  console.log(existsObj);
  if (existsObj) {
    info = await PFModel.findByIdAndUpdate(_id, data, { runValidators: true });
  } else {
    info = await PFModel.create(data);
  }
  return info;
};

//
//

const example_pj = {
  nomeResponsavel: "",
  razaoSocial: "",
  nomeFantasia: "",
  endereco: {
    cep: "",
    pais: "",
    estado: "",
    cidade: "",
    bairro: "",
    rua: "",
    numero: "",
    complemento: "",
  },
  telefones: [
    {
      valor: "",
      descricao: "",
      tipo: "",
    },
  ],
  links: [
    {
      valor: "",
      descricao: "",
      tipo: "",
    },
  ],
  documentos: [
    {
      valor: "",
      descricao: "",
      tipo: "",
    },
  ],
};

exports.postPJ = async (req, res) => {
  const { _id, plano } = req.usuario || {};
  if (!_id) throw new Error("Usuário não encontrado na sessão");
  if (!plano.startsWith("PJ")) throw new Error("Usuário não é PJ");

  const data = { _id };
  if (req.body.nomeResponsavel) data.nomeResponsavel = req.body.nomeResponsavel;
  if (req.body.razaoSocial) data.razaoSocial = req.body.razaoSocial;
  if (req.body.nomeFantasia) data.nomeFantasia = req.body.nomeFantasia;

  if (req.body.endereco) {
    const endereco = req.body.endereco;
    data.endereco = {};
    if (endereco.cep) data.endereco.cep = endereco.cep;
    if (endereco.pais) data.endereco.pais = endereco.pais;
    if (endereco.estado) data.endereco.estado = endereco.estado;
    if (endereco.cidade) data.endereco.cidade = endereco.cidade;
    if (endereco.bairro) data.endereco.bairro = endereco.bairro;
    if (endereco.rua) data.endereco.rua = endereco.rua;
    if (endereco.numero) data.endereco.numero = endereco.numero;
    if (endereco.complemento) data.endereco.complemento = endereco.complemento;
  }

  if (req.body.telefones) {
    data.telefones = [];
    if (req.body.telefones.length > 0) {
      req.body.telefones.forEach((telefone) => {
        if (!tiposTelefone.includes(telefone.tipo))
          throw new Error(`Tipo de telefone inválido "${telefone.tipo}"`);
        if (telefone.valor?.length < 8)
          throw new Error(`Telefone inválido "${telefone.valor}"`);
        const dataTelefone = {
          valor: telefone.valor,
          tipo: telefone.tipo,
        };
        if (telefone.descricao) dataTelefone.descricao = telefone.descricao;
        if (telefone.isPrimario) dataTelefone.isPrimario = telefone.isPrimario;
        data.telefones.push(dataTelefone);
      });
    }
  }

  if (req.body.links) {
    data.links = [];
    if (req.body.links.length > 0) {
      req.body.links.forEach((link) => {
        if (!tiposLink.includes(link.tipo))
          throw new Error(`Tipo de link inválido "${link.tipo}"`);
        if (link.valor?.length < 5)
          throw new Error(`Link inválido "${link.valor}"`);
        const dataLink = {
          valor: link.valor,
          tipo: link.tipo,
        };
        if (link.descricao) dataLink.descricao = link.descricao;
        if (link.isPrimario) dataLink.isPrimario = link.isPrimario;
        data.links.push(dataLink);
      });
    }
  }

  if (req.body.documentos) {
    data.documentos = [];
    if (req.body.documentos.length > 0) {
      req.body.documentos.forEach((documento) => {
        if (!tiposDocumento.includes(documento.tipo))
          throw new Error(`Tipo de documento inválido "${documento.tipo}"`);
        if (!validateDocumento(documento.valor, documento.tipo))
          throw new Error(`Documento inválido "${documento.valor}"`);
        const dataDocumento = {
          valor: documento.valor,
          tipo: documento.tipo,
        };
        data.documentos.push(dataDocumento);
      });
    }
  }

  let info;
  const existsObj = await PJModel.findById(_id);
  console.log(data);
  console.log(existsObj);
  if (existsObj) {
    info = await PJModel.findByIdAndUpdate(_id, data, { runValidators: true });
  } else {
    info = await PJModel.create(data);
  }
  return info;
};
