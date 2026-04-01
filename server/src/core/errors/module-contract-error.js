export class ModuleContractError extends Error {
  constructor(message) {
    super(message);
    this.name = "ModuleContractError";
  }
}
