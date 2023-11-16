const { MailerSend, EmailParams, Sender, Recipient } = require("mailersend");
const config = require("../config");
const path = require("path");
const fs = require("fs");

// const generalParseParams = (params) => params ? [ { email: params.email,
//   substitutions: Object.entries(params).map(([key, value]) => ({
//     var: key, value,
//   })), }, ] : null;
//
const identityFn = (prop) => prop;

const EMAIL_TYPES = {
  FORGOT_PASSWORD: "FORGOT_PASSWORD",
  // NEW_LOGIN: "NEW_LOGIN",
  NEW_SIGNUP: "NEW_SIGNUP",
  PASSWORD_CHANGED: "PASSWORD_CHANGED",
  // REMOCAO_DADOS: "REMOCAO_DADOS",
  CANDIDATURA_VISUALIZADA: "CANDIDATURA_VISUALIZADA",
  CONTRATADO: "CONTRATADO",
  VAGA_PREENCHIDA: "VAGA_PREENCHIDA",
  NOVA_PROPOSTA: "NOVA_PROPOSTA",
};
const EMAIL_TYPE_CONFIG = {
  [EMAIL_TYPES.FORGOT_PASSWORD]: {
    title: "Reset de Senha",
    templateFile: "email-reset-password-send-code.html",
    parseParams: (params) => ({
      verificationCode: params?.verificationCode,
    }),
  },
  // [EMAIL_TYPES.NEW_LOGIN]: {
  //   title: "Novo login",
  // },
  [EMAIL_TYPES.NEW_SIGNUP]: {
    title: "Conta criada com sucesso!",
    templateFile: "email-account-created.html",
  },
  [EMAIL_TYPES.PASSWORD_CHANGED]: {
    title: "Senha Alterada",
    templateFile: "email-password-changed.html",
  },
  // [EMAIL_TYPES.REMOCAO_DADOS]: {
  //   title: "Remoção de Dados",
  //   templateFile: "email-data-removal.html",
  //   parseParams: identityFn,
  // },
  [EMAIL_TYPES.NOVA_PROPOSTA]: {
    title: "Nova Proposta para sua Vaga",
    templateFile: "email-nova-proposta-para-vaga.html",
    parseParams: identityFn,
  },
  [EMAIL_TYPES.CANDIDATURA_VISUALIZADA]: {
    title: "Candidatura Visualizada",
    templateFile: "email-candidatura-visualizada.html",
    parseParams: identityFn,
  },
  [EMAIL_TYPES.CONTRATADO]: {
    title: "Você foi Contratado!",
    templateFile: "email-candidato-contratado.html",
    parseParams: identityFn,
  },
  [EMAIL_TYPES.VAGA_PREENCHIDA]: {
    title: "Uma vaga que você se candidatou foi preenchida",
    templateFile: "email-vaga-preenchida.html",
    parseParams: identityFn,
  },
};

function getEmailFile(fileName) {
  const filePath = path.join(__dirname, "emailTemplates/", fileName);

  let file;
  try {
    file = fs.readFileSync(filePath, { encoding: "utf8", flag: "r" });
  } catch (err) {
    console.log(`Error on reading email template file "${filePath}"`);
  }

  return file;
}

function interpolateEmailParam(contentHTML, key, value) {
  const keyInterpolator = new RegExp(`\\{\\$${key}\\}`, "g");
  return contentHTML.replace(keyInterpolator, value);
}

let emailPartRootLayout = getEmailFile("part-root-layout.html");
let emailPartFooter = getEmailFile("part-footer.html");
emailPartRootLayout = interpolateEmailParam(
  emailPartRootLayout,
  "part-footer",
  emailPartFooter
);

function getEmailTemplate(templateFile, params) {
  let emailHTML = getEmailFile(templateFile);

  if (!emailHTML || emailHTML.length < 1) {
    console.log(`Email template is is EMPTY, skipping`);
    return "";
  }

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      emailHTML = interpolateEmailParam(emailHTML, key, value);
    });
  }

  emailHTML = interpolateEmailParam(
    emailPartRootLayout,
    "email-content",
    emailHTML
  );

  return emailHTML;
}

const mailerSend = new MailerSend({
  apiKey: config.mailersendToken,
});
const sentFrom = new Sender("app@tryevo.com.br", "TryEvo");

function prepareEmail({ email, name, subject, templateFile, params }) {
  console.log(
    `Preparing email to "${email}", "${name}"
  templateFile=${templateFile}`
  );

  const contentHTML = getEmailTemplate(templateFile, params);
  if (!contentHTML) return false;

  const recipients = [new Recipient(email, name)];

  const emailParams = new EmailParams()
    .setFrom(sentFrom)
    .setReplyTo(sentFrom)
    .setTo(recipients)
    .setSubject(subject)
    .setHtml(contentHTML);
  //
  return emailParams;
}

async function _sendEmail(emailArgs) {
  const emailObj = prepareEmail(emailArgs);

  if (!emailObj) return;

  console.log(`Sending email...`);
  const res = await mailerSend.email.send(emailObj);
  console.log(`Sent email, response:`, res);
  return res;
}

async function _sendBulkEmails(emailArgs) {
  const bulkEmails = emailArgs.map((x) => prepareEmail(x)).filter((x) => !!x);

  console.log(`Sending bulk of ${bulkEmails.length} emails...`);
  const res = await mailerSend.email.sendBulk(bulkEmails);
  console.log(`Sent emails, response:`, res);
  return res;
}

/**
 * Send Email
 * @param { email, name, type, params} emailConfig { email, name, type, params }
 */
async function sendEmail(emailConfig) {
  const { email, name, type, params } = emailConfig;

  try {
    const emailTypeConfig = EMAIL_TYPE_CONFIG[type];
    if (emailTypeConfig) {
      let parsedParams = null;
      if (typeof emailTypeConfig.parseParams === "function") {
        parsedParams = emailTypeConfig.parseParams({
          email,
          name,
          ...params,
        });
      }
      return await _sendEmail({
        email,
        name,
        subject: emailTypeConfig.title,
        templateFile: emailTypeConfig.templateFile,
        params: parsedParams,
      });
    } else {
      console.log(`Send Email of type "${type}" not implemented, nothing sent`);
    }
  } catch (e) {
    console.error("Error on sending email", { email, type, params });
    console.error(e);
  }
}

/**
 * Send several Emails
 * @param [{ email, name, type, params}] emailConfig [{ email, name, type, params }]
 */
async function sendBulkEmails(emailsConfig) {
  try {
    const emailArgs = (emailsConfig || [])
      .map((emailConfig) => {
        const emailTypeConfig = EMAIL_TYPE_CONFIG[emailConfig.type];
        if (emailTypeConfig) {
          let parsedParams = null;
          if (typeof emailTypeConfig.parseParams === "function") {
            parsedParams = emailTypeConfig.parseParams({
              email: emailConfig.email,
              name: emailConfig.name,
              ...emailConfig.params,
            });
          }
          return {
            email: emailConfig.email,
            name: emailConfig.name,
            subject: emailTypeConfig.title,
            templateFile: emailTypeConfig.templateFile,
            params: parsedParams,
          };
        } else {
          console.log(
            `Send Email of type "${type}" not implemented, not added to bulk`
          );
          return null;
        }
      })
      .filter((x) => x);
    //

    if (emailArgs?.length > 0) {
      return await _sendBulkEmails(emailArgs);
    } else {
      console.error("No emails to send in bulk emails")
    }
  } catch (e) {
    console.error("Error on sending bulk emails", { emailsConfig });
    console.error(e);
  }
}

module.exports = {
  sendEmail,
  sendBulkEmails,
  EMAIL_TYPES,
};
