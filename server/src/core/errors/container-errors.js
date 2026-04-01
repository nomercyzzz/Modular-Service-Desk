export class ContainerError extends Error {
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class InvalidServiceTokenError extends ContainerError {
  constructor(token) {
    super(`Некорректный токен сервиса: "${String(token)}".`);
  }
}

export class ServiceAlreadyRegisteredError extends ContainerError {
  constructor(tokenName) {
    super(`Сервис "${tokenName}" уже зарегистрирован.`);
  }
}

export class ServiceNotRegisteredError extends ContainerError {
  constructor(tokenName) {
    super(`Сервис "${tokenName}" не зарегистрирован в контейнере.`);
  }
}

export class InvalidServiceFactoryError extends ContainerError {
  constructor(tokenName) {
    super(`Сервис "${tokenName}" должен быть зарегистрирован через фабричную функцию.`);
  }
}

export class InvalidServiceLifetimeError extends ContainerError {
  constructor(tokenName, lifetime) {
    super(
      `Сервис "${tokenName}" использует неподдерживаемый lifetime "${lifetime}". Используйте "singleton" или "transient".`
    );
  }
}
