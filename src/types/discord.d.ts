import { Collection } from "discord.js";

declare module "discord.js" {
    interface Client {
        messageCommands: Collection<string, MessageCommand>;
        aliases: Collection<string, string>
        prefix: string;
    }
}
