/* Minimal Workers-compatible logger (pino is Node-only). */

type LogArgs = [message?: unknown, ...optionalParams: unknown[]];

function format(level: string, args: LogArgs): LogArgs {
  if (typeof args[0] === 'string') {
    return [`[${level}] ${args[0]}`, ...args.slice(1)];
  }
  return [`[${level}]`, ...args];
}

export const logger = {
  debug(...args: LogArgs): void {
    console.debug(...format('debug', args));
  },
  info(...args: LogArgs): void {
    console.log(...format('info', args));
  },
  warn(...args: LogArgs): void {
    console.warn(...format('warn', args));
  },
  error(...args: LogArgs): void {
    console.error(...format('error', args));
  },
};

export default logger;
