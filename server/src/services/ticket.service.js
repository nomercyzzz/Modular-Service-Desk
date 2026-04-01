export class TicketService {
  constructor() {
    this.tickets = [];
    this.nextId = 1;
  }

  create(input = {}) {
    const title = typeof input.title === "string" ? input.title.trim() : "";
    if (title.length === 0) {
      throw createValidationError('Поле тикета "title" обязательно.');
    }

    const description =
      typeof input.description === "string" ? input.description.trim() : "";

    const ticket = {
      id: this.nextId++,
      title,
      description,
      status: "открыт",
      createdAt: new Date().toISOString()
    };

    this.tickets.push(ticket);

    return { ...ticket };
  }

  getAll() {
    return this.tickets.map((ticket) => ({ ...ticket }));
  }

  getById(id) {
    const parsedId = Number(id);
    if (!Number.isInteger(parsedId) || parsedId <= 0) {
      return null;
    }

    const ticket = this.tickets.find((item) => item.id === parsedId);
    return ticket ? { ...ticket } : null;
  }
}

function createValidationError(message) {
  const error = new Error(message);
  error.code = "VALIDATION_ERROR";
  return error;
}
