import {
  createTransport,
  type SendMailOptions,
  type Transporter,
} from "nodemailer";

import { ServiceError } from "./errors";

export const defaultTransporter = createTransport({
  host: process.env.EMAIL_SMTP_HOST,
  port: Number(process.env.EMAIL_SMTP_PORT),
  auth: {
    user: process.env.EMAIL_SMTP_USER,
    pass: process.env.EMAIL_SMTP_PASSWORD,
  },
  secure: process.env.NODE_ENV === "production",
});

async function send(
  mailOptions: SendMailOptions,
  transport: Transporter = defaultTransporter,
) {
  try {
    return await transport.sendMail(mailOptions);
  } catch (error) {
    throw new ServiceError({
      message: "Falha ao enviar email. O serviço de SMTP não está disponível.",
      action: "Confira se o servidor de SMTP está ativo e tente novamente.",
      cause: error as Error,
    });
  }
}

const email = {
  send,
};

export default email;
