import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import chalk from "chalk";
import { AlignmentEnum, AsciiTable3 } from "ascii-table3";
import type { Client } from "discord.js";
import logger from "../shared/logger.js";
import type { MessageCommand } from "../types/command.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const commandsDir = path.join(__dirname, "..", "messageCommands");

export default async (client: Client) => {
    const table = new AsciiTable3("Message Commands")
        .setHeading("Category", "Command", "Stat")
        .setAlign(2, AlignmentEnum.CENTER);

    const categories = fs
        .readdirSync(commandsDir, { withFileTypes: true })
        .filter((entry) => entry.isDirectory());

    for (const category of categories) {
        const categoryDir = path.join(commandsDir, category.name);
        const files = fs
            .readdirSync(categoryDir)
            .filter((file) => /\.(ts|js)$/.test(file) && !file.endsWith(".d.ts"));

        for (const file of files) {
            const fileName = path.parse(file).name;
            try {
                const { default: command } = (await import(
                    pathToFileURL(path.join(categoryDir, file)).href
                    )) as { default?: MessageCommand };

                if (!command?.name || typeof command.execute !== "function") {
                    table.addRow(category.name, fileName, "⛔");
                    continue;
                }

                client.messageCommands.set(command.name, command);
                for (const alias of command.aliases ?? []) {
                    client.aliases.set(alias, command.name);
                }
                table.addRow(category.name, command.name, "✅");
            } catch (err) {
                table.addRow(category.name, fileName, "❌");
                logger.error(`Message Command ${fileName} could not be loaded:`, err);
            }
        }
    }

    logger.log(chalk.blue(table.toString()));
};
