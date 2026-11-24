import { Client, Collection, GatewayIntentBits, Partials } from "discord.js";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const client = new Client({
    intents: [
        GatewayIntentBits.GuildScheduledEvents,
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.AutoModerationConfiguration,
        GatewayIntentBits.AutoModerationExecution,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMembers,
    ],
    partials: [Partials.Channel, Partials.Message, Partials.User, Partials.GuildMember, Partials.Reaction],
});

client.messageCommands = new Collection();
client.aliases = new Collection();
client.prefix = process.env.PREFIX || "!";

export default client;

(async () => {
    const handlersDir = path.join(__dirname, "handlers");
    const files = fs
        .readdirSync(handlersDir)
        .filter((f) => /\.(ts|js)$/.test(f) && !f.endsWith(".d.ts"));

    for (const file of files) {
        const { default: handlerFn } = await import(
            pathToFileURL(path.join(handlersDir, file)).href
            );
        await handlerFn(client);
    }

    await client.login(process.env.DISCORD_TOKEN);
})().catch((err) => {
    console.error(err);
    process.exit(1);
});
