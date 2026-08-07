interface ErrorOptions {
  cause?: unknown;
  message?: string;
  action?: string;
  statusCode?: number;
}

export class InternalServerError extends Error {
  public readonly action: string;
  public readonly statusCode: number;

  constructor({ cause, statusCode }: ErrorOptions = {}) {
    super("Um erro interno não esperado aconteceu.", { cause });

    Object.setPrototypeOf(this, new.target.prototype);

    this.name = "InternalServerError";
    this.action = "Entre em contato com o suporte.";
    this.statusCode = statusCode ?? 500;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      action: this.action,
      status_code: this.statusCode,
    };
  }
}

export class ServiceError extends Error {
  public readonly action: string;
  public readonly statusCode: number;

  constructor({ cause, message }: ErrorOptions = {}) {
    super(message ?? "Serviço indisponível no momento.", { cause });

    Object.setPrototypeOf(this, new.target.prototype);

    this.name = "ServiceError";
    this.action = "Verifique se o serviço está disponível.";
    this.statusCode = 503;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      action: this.action,
      status_code: this.statusCode,
    };
  }
}

export class ValidationError extends Error {
  public readonly action: string;
  public readonly statusCode: number;

  constructor({ cause, message, action }: ErrorOptions = {}) {
    super(message ?? "Um erro de validação ocorreu.", { cause });

    Object.setPrototypeOf(this, new.target.prototype);

    this.name = "ValidationError";
    this.action = action ?? "Ajuste os dados enviados e tente novamente.";
    this.statusCode = 400;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      action: this.action,
      status_code: this.statusCode,
    };
  }
}

export class NotFoundError extends Error {
  public readonly action: string;
  public readonly statusCode: number;

  constructor({ cause, message, action }: ErrorOptions = {}) {
    super(message ?? "Não foi possível encontrar este recurso no sistema.", {
      cause,
    });

    Object.setPrototypeOf(this, new.target.prototype);

    this.name = "NotFoundError";
    this.action =
      action ?? "Verifique se os parâmetros enviados na consulta estão certos.";
    this.statusCode = 404;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      action: this.action,
      status_code: this.statusCode,
    };
  }
}

export class UnauthorizedError extends Error {
  public readonly action: string;
  public readonly statusCode: number;

  constructor({ cause, message, action }: ErrorOptions = {}) {
    super(message ?? "Usuário não autenticado.", { cause });

    Object.setPrototypeOf(this, new.target.prototype);

    this.name = "UnauthorizedError";
    this.action = action ?? "Faça novamente o login para continuar.";
    this.statusCode = 401;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      action: this.action,
      status_code: this.statusCode,
    };
  }
}

export class ForbiddenError extends Error {
  public readonly action: string;
  public readonly statusCode: number;

  constructor({ cause, message, action }: ErrorOptions = {}) {
    super(message ?? "Acesso negado.", { cause });

    Object.setPrototypeOf(this, new.target.prototype);

    this.name = "ForbiddenError";
    this.action =
      action ?? "Verifique as features necessárias antes de continuar.";
    this.statusCode = 403;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      action: this.action,
      status_code: this.statusCode,
    };
  }
}

export class MethodNotAllowedError extends Error {
  public readonly action: string;
  public readonly statusCode: number;

  constructor({ cause, message, action }: ErrorOptions = {}) {
    super(message ?? "Método não permitido para este endpoint.", {
      cause,
    });

    Object.setPrototypeOf(this, new.target.prototype);

    this.name = "MethodNotAllowedError";
    this.action =
      action ??
      "Verifique se o método HTTP enviado é válido para este endpoint.";
    this.statusCode = 405;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      action: this.action,
      status_code: this.statusCode,
    };
  }
}
