import {
  InvalidServiceFactoryError,
  InvalidServiceLifetimeError,
  InvalidServiceTokenError,
  ServiceAlreadyRegisteredError,
  ServiceNotRegisteredError
} from "../errors/container-errors.js";

export const SERVICE_LIFETIMES = Object.freeze({
  SINGLETON: "singleton",
  TRANSIENT: "transient"
});

export class ServiceContainer {
  constructor() {
    this.registrations = new Map();
    this.singletons = new Map();
  }

  register(token, factory, options = {}) {
    const normalizedToken = normalizeToken(token);
    const tokenName = getTokenName(normalizedToken);

    if (this.registrations.has(normalizedToken)) {
      throw new ServiceAlreadyRegisteredError(tokenName);
    }

    if (typeof factory !== "function") {
      throw new InvalidServiceFactoryError(tokenName);
    }

    const lifetime = options.lifetime || SERVICE_LIFETIMES.SINGLETON;
    if (!Object.values(SERVICE_LIFETIMES).includes(lifetime)) {
      throw new InvalidServiceLifetimeError(tokenName, lifetime);
    }

    this.registrations.set(normalizedToken, { factory, lifetime });

    return this;
  }

  registerSingleton(token, factory) {
    return this.register(token, factory, { lifetime: SERVICE_LIFETIMES.SINGLETON });
  }

  registerTransient(token, factory) {
    return this.register(token, factory, { lifetime: SERVICE_LIFETIMES.TRANSIENT });
  }

  has(token) {
    const normalizedToken = normalizeToken(token);
    return this.registrations.has(normalizedToken);
  }

  resolve(token) {
    const normalizedToken = normalizeToken(token);
    const tokenName = getTokenName(normalizedToken);
    const registration = this.registrations.get(normalizedToken);

    if (!registration) {
      throw new ServiceNotRegisteredError(tokenName);
    }

    if (registration.lifetime === SERVICE_LIFETIMES.SINGLETON) {
      if (!this.singletons.has(normalizedToken)) {
        this.singletons.set(normalizedToken, registration.factory(this));
      }

      return this.singletons.get(normalizedToken);
    }

    return registration.factory(this);
  }
}

function normalizeToken(token) {
  if (typeof token === "string") {
    const normalized = token.trim();
    if (normalized.length === 0) {
      throw new InvalidServiceTokenError(token);
    }

    return normalized;
  }

  if (typeof token === "symbol" || typeof token === "function") {
    return token;
  }

  throw new InvalidServiceTokenError(token);
}

function getTokenName(token) {
  if (typeof token === "string") {
    return token;
  }

  if (typeof token === "symbol") {
    return token.description || token.toString();
  }

  if (typeof token === "function") {
    return token.name || "анонимная_функция";
  }

  return String(token);
}
