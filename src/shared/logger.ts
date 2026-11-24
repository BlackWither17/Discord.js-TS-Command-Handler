/* eslint-disable no-console */
import chalk from "chalk";

const timestamp = () => chalk.gray(`[${new Date().toISOString()}]`);

const logger = {
    info: (...args: unknown[]) => console.log(timestamp(), chalk.blue("INFO:"), ...args),
    warn: (...args: unknown[]) => console.warn(timestamp(), chalk.yellow("WARN:"), ...args),
    error: (...args: unknown[]) => console.error(timestamp(), chalk.red("ERROR:"), ...args),
    success: (...args: unknown[]) => console.log(timestamp(), chalk.green("SUCCESS:"), ...args),
    debug: (...args: unknown[]) => {
      if (process.env.DEBUG) {
          console.debug(timestamp(), chalk.cyanBright("DEBUG:"), ...args)
      }
    },
    log: (...args: unknown[]) => console.log(...args),
};

export default logger;
