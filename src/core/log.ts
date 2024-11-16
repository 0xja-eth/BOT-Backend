export enum LogLevel {
  Debug = 0,
  Info = 1,
  Warn = 2,
  Error = 3,
}

export const ShowLogLevel = [
  LogLevel.Debug,
  LogLevel.Info,
  LogLevel.Warn,
  LogLevel.Error,
];

export interface Logger {
  get logTag(): string;
}

export function log(logger: Logger, level: LogLevel, ...args) {
  if (ShowLogLevel.indexOf(level) < 0) return;

  switch (level) {
    case LogLevel.Debug:
      console.log(`[Debug: ${logger.logTag}]`, ...args);
      break;
    case LogLevel.Info:
      console.log(`[Info: ${logger.logTag}]`, ...args);
      break;
    case LogLevel.Warn:
      console.warn(`[Warn: ${logger.logTag}]`, ...args);
      break;
    case LogLevel.Error:
      console.error(`[Error: ${logger.logTag}]`, ...args);
      // console.trace(args.find(a => a instanceof Error));
      break;
  }
}

export function logInfo(logger: Logger, ...args) {
  log(logger, LogLevel.Info, ...args);
}
export function logDebug(logger: Logger, ...args) {
  log(logger, LogLevel.Debug, ...args);
}
export function logWarn(logger: Logger, ...args) {
  log(logger, LogLevel.Warn, ...args);
}
export function logError(logger: Logger, ...args) {
  log(logger, LogLevel.Error, ...args);
}
