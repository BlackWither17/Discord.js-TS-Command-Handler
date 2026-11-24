import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import chalk from "chalk";
import { AlignmentEnum, AsciiTable3 } from "ascii-table3";
import logger from "../shared/logger.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const eventsDir = path.join(__dirname, "..", "events");

export default async () => {
    const table = new AsciiTable3("Events")
        .setHeading("Event", "Stat")
        .setAlign(2, AlignmentEnum.CENTER);

    const files = fs
        .readdirSync(eventsDir)
        .filter((file) => /\.(ts|js)$/.test(file) && !file.endsWith(".d.ts"));

    for (const file of files) {
        const name = path.parse(file).name;
        try {
            await import(pathToFileURL(path.join(eventsDir, file)).href);
            table.addRow(name, "✅");
        } catch (err) {
            table.addRow(name, "❌");
            logger.error(`Event ${name} could not be loaded: ${err}`);
        }
    }

    logger.log(chalk.greenBright(table.toString()));
};
