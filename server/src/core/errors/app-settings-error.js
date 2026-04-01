export class AppSettingsError extends Error {
  constructor(message, cause) {
    super(message, cause ? { cause } : undefined);
    this.name = "AppSettingsError";
  }
}
