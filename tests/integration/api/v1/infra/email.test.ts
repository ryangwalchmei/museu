import { beforeAll, describe, expect, test } from "@jest/globals";

import email from "infra/email";
import { ServiceError } from "infra/errors";
import orchestrator from "tests/orchestrator";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
});

describe("infra/email.js", () => {
  test("send()", async () => {
    await orchestrator.deleteAllEmails();

    await email.send({
      from: "Ryan Gwalchmei <contato@gwalchmei.com.br>",
      to: "contato@gwalchmei.com.br",
      subject: "Teste de assunto",
      text: "Teste de corpo.",
    });

    await email.send({
      from: "Ryan Gwalchmei <contato@gwalchmei.com.br>",
      to: "contato@gwalchmei.com.br",
      subject: "Último email enviado",
      text: "Corpo do último email.",
    });

    const lastEmail = await orchestrator.getLastEmail();
    expect(lastEmail.sender).toBe("<contato@gwalchmei.com.br>");
    expect(lastEmail.recipients[0]).toBe("<contato@gwalchmei.com.br>");
    expect(lastEmail.subject).toBe("Último email enviado");
    expect(lastEmail.text).toBe("Corpo do último email.\r\n");
  });

  test("With SMTP unavailable", async () => {
    await orchestrator.deleteAllEmails();

    const invalidTransporter = orchestrator.createACustomTransporter({
      host: "localhost",
      port: 587,
      auth: {
        user: "invalid_user",
        pass: "invalid_password",
      },
    });

    const result = email.send(
      {
        from: "Ryan Gwalchmei <contato@gwalchmei.com.br>",
        to: "contato@gwalchmei.com.br",
        subject: "SMTP unavailable",
        text: "Teste de corpo.",
      },
      invalidTransporter,
    );

    await expect(result).rejects.toBeInstanceOf(ServiceError);
    await expect(result).rejects.toMatchObject({
      message: "Falha ao enviar email. O serviço de SMTP não está disponível.",
    });
  });
});
