export class LoggerService {
  info(message, details) {
    this.write("ИНФО", message, details);
  }

  warn(message, details) {
    this.write("ПРЕДУПРЕЖДЕНИЕ", message, details);
  }

  error(message, details) {
    this.write("ОШИБКА", message, details);
  }

  write(level, message, details) {
    const safeMessage = typeof message === "string" ? message : String(message);
    const timestamp = new Date().toISOString();
    const line = `[${timestamp}] [${level}] ${safeMessage}`;

    if (details === undefined) {
      console.log(line);
      return;
    }

    console.log(line, details);
  }
}
