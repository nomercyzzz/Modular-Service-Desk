import path from "node:path";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { AppSettingsError } from "../errors/app-settings-error.js";

const DEFAULT_APP_SETTINGS_PATH = fileURLToPath(
  new URL("../../../appsettings.json", import.meta.url)
);

export async function readAppSettings(options = {}) {
  const filePath = path.resolve(options.filePath || DEFAULT_APP_SETTINGS_PATH);

  const rawConfig = await readConfigFile(filePath);
  const parsedConfig = parseJson(rawConfig, filePath);

  return normalizeAppSettings(parsedConfig, filePath);
}

async function readConfigFile(filePath) {
  try {
    return await readFile(filePath, "utf8");
  } catch (error) {
    throw new AppSettingsError(`Не удалось прочитать файл конфигурации: ${filePath}.`, error);
  }
}

function parseJson(rawConfig, filePath) {
  try {
    return JSON.parse(rawConfig);
  } catch (error) {
    throw new AppSettingsError(
      `Файл конфигурации ${filePath} содержит некорректный JSON.`,
      error
    );
  }
}

function normalizeAppSettings(config, filePath) {
  if (!config || typeof config !== "object" || Array.isArray(config)) {
    throw new AppSettingsError(`Файл ${filePath} должен содержать JSON-объект.`);
  }

  const port = normalizePort(config.port, filePath);
  const activeModules = normalizeActiveModules(config.activeModules, filePath);

  return { port, activeModules };
}

function normalizePort(port, filePath) {
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new AppSettingsError(
      `Поле "port" в ${filePath} должно быть целым числом от 1 до 65535.`
    );
  }

  return port;
}

function normalizeActiveModules(activeModules, filePath) {
  if (!Array.isArray(activeModules)) {
    throw new AppSettingsError(`Поле "activeModules" в ${filePath} должно быть массивом.`);
  }

  const normalizedModules = activeModules.map((moduleName, index) => {
    if (typeof moduleName !== "string" || moduleName.trim().length === 0) {
      throw new AppSettingsError(
        `Элемент activeModules[${index}] в ${filePath} должен быть непустой строкой.`
      );
    }

    return moduleName.trim();
  });

  const duplicates = findDuplicates(normalizedModules);
  if (duplicates.length > 0) {
    throw new AppSettingsError(
      `Поле "activeModules" в ${filePath} содержит дубли: ${duplicates.join(", ")}.`
    );
  }

  return normalizedModules;
}

function findDuplicates(values) {
  const seen = new Set();
  const duplicates = new Set();

  for (const value of values) {
    if (seen.has(value)) {
      duplicates.add(value);
      continue;
    }

    seen.add(value);
  }

  return Array.from(duplicates);
}
