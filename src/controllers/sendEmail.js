const { MailerSend, EmailParams, Sender, Recipient } = require("mailersend");
const config = require("../config");

const mailerSend = new MailerSend({
  apiKey: config.mailersendToken,
});
const sentFrom = new Sender("app@tryevo.com.br", "TryEvo");

const EMAIL_TYPES = {
  FORGOT_PASSWORD: "FORGOT_PASSWORD",
  NEW_LOGIN: "NEW_LOGIN",
  NEW_SIGNUP: "NEW_SIGNUP",
  PASSWORD_CHANGED: "PASSWORD_CHANGED",
}
const EMAIL_TYPE_CONFIG = {
  [EMAIL_TYPES.FORGOT_PASSWORD]: {
    title: "Reset de Senha",
  },
  [EMAIL_TYPES.NEW_LOGIN]: {
    title: "Novo login",
  },
  [EMAIL_TYPES.NEW_SIGNUP]: {
    title: "Conta criada com sucesso!",
    templateId: "zr6ke4nwk8m4on12",
  },
  [EMAIL_TYPES.PASSWORD_CHANGED]: {
    title: "Senha Alterada",
    templateId: "vywj2lpvex1l7oqz",
  },
};

async function _sendEmail(
  recipientEmail,
  recipientName,
  subject,
  templateId,
  emailContent,
) {
  console.log(`Preparing email to "${recipientEmail}", "${recipientName}", templateId=${templateId}`);

  const recipients = [new Recipient(recipientEmail, recipientName)];

  const emailParams = new EmailParams()
    .setFrom(sentFrom)
    .setReplyTo(sentFrom)
    .setTo(recipients)
    .setSubject(subject);

  if (emailContent) {
    emailParams.setHtml(emailContent)
  }
  if (templateId) {
    emailParams.setTemplateId(templateId)
  }

  console.log(`Sending email...`);
  const res = await mailerSend.email.send(emailParams);
  console.log(`Sent email, response:`, res);
  return res;
}

async function sendEmail(recipientEmail, recipientName, type, params) {
  try {
    const emailTypeConfig = EMAIL_TYPE_CONFIG[type]
    if (emailTypeConfig) {
      let content = null;
      if (typeof emailTypeConfig.parseParams === "function") {
        content = emailTypeConfig.parseParams(params);
      }
      return await _sendEmail(
        recipientEmail,
        recipientName,
        emailTypeConfig.title,
        emailTypeConfig.templateId,
        content,
      );
    } else {
      console.log(`Send Email of type "${type}" not implemented, nothing sent`)
    }
  } catch (e) {
    console.error("Error on sending email", { recipientEmail, type, params });
    console.error(e);
  }
}

module.exports = {
  sendEmail,
  EMAIL_TYPES,
}