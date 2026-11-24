import type { MessageCommand } from "../../types/command.js";
import {ChannelType} from "discord.js";

const command: MessageCommand = {
    name: "ping",
    aliases: ["p"],
    execute: async (_client, message) => {
        await message.reply("Pong!");
    },
};

export default command;
