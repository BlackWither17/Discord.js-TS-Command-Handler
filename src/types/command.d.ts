import type { ChannelType, Client, Message, PermissionResolvable } from "discord.js";

export interface MessageCommand {
    name: string;
    aliases?: string[];
    description?: string;
    allowedChannelTypes?: ChannelType[];
    cooldown?: number; // in ms
    userPerms?: PermissionResolvable[];
    botPerms?: PermissionResolvable[];
    execute: (client: Client, message: Message, args: string[]) => Promise<void> | void;
}
