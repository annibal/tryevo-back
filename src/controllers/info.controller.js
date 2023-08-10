const mongoose = require("mongoose");

const {
  TIPO_TELEFONE,
  TIPO_DOCUMENTO,
  TIPO_LINK,
  FLUENCIA_LINGUAGEM,
  TIPO_ESCOLARIDADE,
  TIPO_GENERO,
  TIPO_ESTADO_CIVIL,
  TIPO_CNH,
} = require("../schemas/enums");

const tiposTelefone = Object.values(TIPO_TELEFONE);
const tiposDocumento = Object.values(TIPO_DOCUMENTO);
const tiposLink = Object.values(TIPO_LINK);
const tiposFluenciaLinguagem = Object.values(FLUENCIA_LINGUAGEM);
const tiposEscolaridade = Object.values(TIPO_ESCOLARIDADE);
const tiposGenero = Object.values(TIPO_GENERO);
const tiposEstadoCivil = Object.values(TIPO_ESTADO_CIVIL);
const tiposCNH = Object.values(TIPO_CNH);

// const UsuarioSchema = require("../schemas/usuario.schema");
// const ManySchema = require("../schemas/many.schema");
// const ProjetosPessoaisSchema = require("../schemas/projetos-pessoais.schema");
// const EscolaridadeSchema = require("../schemas/escolaridade.schema");
// const ExperienciaProfissionalSchema = require("../schemas/experiencia-profissional.schema");
// const EnderecoSchema = require("../schemas/endereco.schema");
// const QualificacaoSchema = require("../schemas/qualificacao.schema");
const PFSchema = require("../schemas/pf.schema");
const PJSchema = require("../schemas/pj.schema");
const CBOSchema = require("../schemas/cbo.schema")
const HabilidadeSchema = require("../schemas/habilidade.schema");
const QualificacaoSchema = require("../schemas/qualificacao.schema");
const validateDocumento = require("../helpers/validateDocumento");
const parseDMYdate = require("../helpers/parseDMYdate");

const PFModel = mongoose.model("PF", PFSchema);
const PJModel = mongoose.model("PJ", PJSchema);
const CBOModel = mongoose.model("CBO", CBOSchema);
const HabilidadeModel = mongoose.model("Habilidade", HabilidadeSchema);
const QualificacaoModel = mongoose.model("Qualificacao", QualificacaoSchema);

exports.getSelf = async (req, res) => {
  const { _id, plano } = req.usuario || {};
  if (!_id) throw new Error("Usuário não encontrado na sessão");

  if (plano.startsWith("PJ")) {
    const dados = await PJModel.findById(_id);
    return dados;

  } else {
    const dados = await PFModel.findById(_id).lean();
    if (dados.objetivos?.length > 0) {
      for (let i = 0; i < dados.objetivos.length; i++) {
        const cargoObj = await CBOModel.findById(dados.objetivos[i].cargo)
        dados.objetivos[i].cargo = cargoObj;
      }
    }
    if (dados.experienciasProfissionais?.length > 0) {
      for (let i = 0; i < dados.experienciasProfissionais.length; i++) {
        const cargoObj = await CBOModel.findById(dados.experienciasProfissionais[i].cargo).lean()
        dados.experienciasProfissionais[i].cargo = cargoObj;

        if (dados.experienciasProfissionais[i].qualificacoes?.length > 0) {
          for (let j = 0; j < dados.experienciasProfissionais[i].qualificacoes.length; j++) {
            const qualificacaoObj = await QualificacaoModel.findById(dados.experienciasProfissionais[i].qualificacoes[j]).lean()
            console.log({qualificacaoObj})
            dados.experienciasProfissionais[i].qualificacoes[j] = qualificacaoObj
          }
        }
      }
    }
    if (dados.habilidades?.length > 0) {
      for (let i = 0; i < dados.habilidades.length; i++) {
        const habilidadeObj = await HabilidadeModel.findById(dados.habilidades[i])
        dados.habilidades[i] = habilidadeObj;
      }
    }
    return dados;

  }
};

exports.getById = async (req, res) => {
  const dataPF = await PFModel.findById(req.params.id);
  const dataPJ = await PJModel.findById(req.params.id);
  return {
    dataPF,
    dataPJ,
  };
}


exports.postPF = async (req, res) => {
  const { _id, plano } = req.usuario || {};
  if (!_id) throw new Error("Usuário não encontrado na sessão");
  if (!plano.startsWith("PF")) throw new Error("Usuário não é PF");

  const data = { _id };
  if (req.body.nomePrimeiro) data.nomePrimeiro = req.body.nomePrimeiro;
  if (req.body.nomeUltimo) data.nomeUltimo = req.body.nomeUltimo;
  if (req.body.nomePreferido) data.nomePreferido = req.body.nomePreferido;
  if (req.body.nacionalidade) data.nacionalidade = req.body.nacionalidade;
  if (req.body.nascimento) data.nascimento = parseDMYdate(req.body.nascimento);
  if (req.body.pcd) data.pcd = !!req.body.pcd;
  if (req.body.pcdDescrição) data.pcdDescrição = !!req.body.pcdDescrição;
  if (req.body.aceitaTrabalharDistancia)
    data.aceitaTrabalharDistancia = Math.floor(
      req.body.aceitaTrabalharDistancia
    );
  if (req.body.aceitaMudarDistancia)
    data.aceitaMudarDistancia = Math.floor(req.body.aceitaMudarDistancia);
  if (req.body.genero) {
    if (!tiposGenero.includes(req.body.genero))
      throw new Error(`Tipo de gênero inválido "${req.body.genero}`);
    data.genero = req.body.genero;
  }
  if (req.body.categoriaCNH) {
    if (!tiposCNH.includes(req.body.categoriaCNH))
      throw new Error(`Categoria de CNH inválida "${req.body.genero}`);
    data.categoriaCNH = req.body.categoriaCNH;
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

  if (req.body.cpf) data.cpf = req.body.cpf.replace(/[^0-9]/gi, '');
  if (req.body.rg) data.rg = req.body.rg.replace(/[^0-9X]/gi, '');
  if (req.body.passaporte) data.passaporte = req.body.passaporte.replace(/[^0-9]/gi, '');
  if (req.body.cnh) data.cnh = req.body.cnh.replace(/[^0-9]/gi, '');

  if (req.body.objetivos) {
    data.objetivos = [];
    if (req.body.objetivos.length > 0) {
      req.body.objetivos.slice(0, 3).forEach((objetivo, idx) => {
        const dataObjetivo = {
          cargo: objetivo.cargo._id,
          remuneracao: parseFloat(objetivo.remuneracao)
        }
        data.objetivos.push(dataObjetivo);
      });
    }
  }

  if (req.body.linguagens) {
    data.linguagens = [];
    if (req.body.linguagens.length > 0) {
      req.body.linguagens.forEach((linguagem, idx) => {
        if (!tiposFluenciaLinguagem.includes(linguagem.tipo))
          throw new Error(
            `Tipo de fluencia de linguagem ${idx + 1} inválido "${linguagem.tipo}"`
          );
        if (linguagem.valor?.length < 4)
          throw new Error(`Linguagem ${idx + 1} inválida "${linguagem.valor}"`);
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
          dataProjetoPessoal.quando = parseDMYdate(projetoPessoal.quando);
        data.projetosPessoais.push(dataProjetoPessoal);
      });
    }
  }

  if (req.body.escolaridades) {
    data.escolaridades = [];
    if (req.body.escolaridades.length > 0) {
      req.body.escolaridades.forEach((escolaridade, idx) => {
        const dataEscolaridade = {};
        if (escolaridade.isCompleto && !escolaridade.fim)
          throw new Error(`Escolaridade ${idx + 1} informada como completa necessita da data de fim`);
        if (!escolaridade.isCompleto && escolaridade.fim)
          throw new Error(`Escolaridade ${idx + 1} não foi completada portanto não deve ter uma data de fim`);
        if (
          escolaridade.inicio &&
          escolaridade.fim &&
          new Date(parseDMYdate(escolaridade.inicio)) >= new Date(parseDMYdate(escolaridade.fim))
        )
          throw new Error(`Fim da Escolaridade ${idx + 1} deve ser antes do inicio`);
        if (escolaridade.nivel) {
          if (!tiposEscolaridade.includes(escolaridade.nivel))
            throw new Error(
              `Tipo de escolaridade ${idx + 1} inválido "${escolaridade.nivel}"`
            );
          dataEscolaridade.nivel = escolaridade.nivel;
        }
        if (escolaridade.isCompleto)
          dataEscolaridade.isCompleto = !!escolaridade.isCompleto;
        if (escolaridade.nome) dataEscolaridade.nome = escolaridade.nome;
        if (escolaridade.inicio) dataEscolaridade.inicio = parseDMYdate(escolaridade.inicio);
        if (escolaridade.fim) dataEscolaridade.fim = parseDMYdate(escolaridade.fim);
        data.escolaridades.push(dataEscolaridade);
      });
    }
  }

  if (req.body.experienciasProfissionais) {
    data.experienciasProfissionais = [];
    if (req.body.experienciasProfissionais.length > 0) {
      req.body.experienciasProfissionais.forEach((experienciaProfissional, idx) => {
        const dataExperienciaProfissional = {};
        if (!experienciaProfissional.fim && !experienciaProfissional.isAtual)
          throw new Error(
            `Experiência Profissional ${idx + 1} deve ter um fim ou ser atual`
          );
        if (experienciaProfissional.fim && experienciaProfissional.isAtual)
          throw new Error(
            `Experiência Profissional ${idx + 1} deve ou ter um fim ou ser atual`
          );
        if (
          experienciaProfissional.inicio &&
          experienciaProfissional.fim &&
          new Date(parseDMYdate(experienciaProfissional.inicio)) >=
            new Date(parseDMYdate(experienciaProfissional.fim))
        )
          throw new Error(
            `Fim da Experiência Profissional ${idx + 1} deve ser antes do inicio`
          );

        if (experienciaProfissional.qualificacoes && experienciaProfissional.qualificacoes.length > 0)
          dataExperienciaProfissional.qualificacoes = experienciaProfissional.qualificacoes.map(x => x._id);
        if (experienciaProfissional.cargo && experienciaProfissional.cargo._id)
          dataExperienciaProfissional.cargo = experienciaProfissional.cargo._id;
      
        if (experienciaProfissional.ramoAtividadeEmpresa)
          dataExperienciaProfissional.ramoAtividadeEmpresa = experienciaProfissional.ramoAtividadeEmpresa;
        if (experienciaProfissional.empresa)
          dataExperienciaProfissional.empresa = experienciaProfissional.empresa;
        if (experienciaProfissional.descricao)
          dataExperienciaProfissional.descricao =
            experienciaProfissional.descricao;
        if (experienciaProfissional.inicio)
          dataExperienciaProfissional.inicio = parseDMYdate(experienciaProfissional.inicio);
        if (experienciaProfissional.fim)
          dataExperienciaProfissional.fim = parseDMYdate(experienciaProfissional.fim);
        if (experienciaProfissional.isAtual)
          dataExperienciaProfissional.isAtual = experienciaProfissional.isAtual;
        data.experienciasProfissionais.push(dataExperienciaProfissional);
      });
    }
  }

  // if (req.body.qualificacoes && req.body.qualificacoes.length > 0) {
  //   data.qualificacoes = req.body.qualificacoes.map(x => x._id).filter(x => x);
  // }

  if (req.body.habilidades) {
    data.habilidades = req.body.habilidades.map(x => x._id).filter(x => x);
  }

  let info;
  const existsObj = await PFModel.findById(_id);
  if (existsObj) {
    info = await PFModel.findByIdAndUpdate(_id, data, { runValidators: true });
  } else {
    info = await PFModel.create(data);
  }
  return info;
};

//
//


exports.postPJ = async (req, res) => {
  const { _id, plano } = req.usuario || {};
  if (!_id) throw new Error("Usuário não encontrado na sessão");
  if (!plano.startsWith("PJ")) throw new Error("Usuário não é PJ");

  const data = { _id };
  if (req.body.nomeResponsavel) data.nomeResponsavel = req.body.nomeResponsavel;
  if (req.body.razaoSocial) data.razaoSocial = req.body.razaoSocial;
  if (req.body.nomeFantasia) data.nomeFantasia = req.body.nomeFantasia;
  if (req.body.cnpj) data.cnpj = req.body.cnpj;
  if (req.body.inscricaoEstadual) data.inscricaoEstadual = req.body.cnpj;

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

  let info;
  const existsObj = await PJModel.findById(_id);
  if (existsObj) {
    info = await PJModel.findByIdAndUpdate(_id, data, { runValidators: true });
  } else {
    info = await PJModel.create(data);
  }
  return info;
};
