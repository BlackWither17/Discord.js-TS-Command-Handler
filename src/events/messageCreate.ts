import { ChannelType, Collection, EmbedBuilder, Events, PermissionsBitField } from "discord.js";
import type { PermissionResolvable } from "discord.js";
import ms from "ms";
import client from "../index.js";
import logger from "../shared/logger.js";

const DEFAULT_ALLOWED_CHANNELS = [ChannelType.GuildText];
const cooldowns = new Collection<string, number>();

const permNames = (perms: PermissionResolvable[]) =>
    new PermissionsBitField(perms).toArray().join(", ");

client.on(Events.MessageCreate, async (message) => {
    if (message.author.bot) return;

    const prefix = client.prefix;
    if (!message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    const cmd = args.shift()?.toLowerCase();
    if (!cmd) return;

    const command =
        client.messageCommands.get(cmd) ?? client.messageCommands.get(client.aliases.get(cmd) ?? "");
    if (!command) return;

    const allowedChannels = command.allowedChannelTypes ?? DEFAULT_ALLOWED_CHANNELS;
    if (!allowedChannels.includes(message.channel.type)) return;

    if (message.inGuild()) {
        if (command.userPerms?.length && !message.member?.permissions.has(command.userPerms)) {
            const text = (process.env.NO_PERMISSIONS_MESSAGE ?? "🚫 <user>, you need: `<permissions>`")
                .replace("<permissions>", permNames(command.userPerms))
                .replace("<user>", message.author.toString());
            await message.reply({
                embeds: [new EmbedBuilder().setDescription(text).setColor("Red")],
            });
            return;
        }

        const me = message.guild.members.me;
        if (command.botPerms?.length && !me?.permissions.has(command.botPerms)) {
            await message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setDescription(
                            `🚫 ${message.author}, I miss the \`${permNames(command.botPerms)}\` permission!`,
                        )
                        .setColor("Red"),
                ],
            });
            return;
        }
    }

    // Cooldown
    const key = `${command.name}:${message.author.id}`;
    if (command.cooldown) {
        const expires = cooldowns.get(key);
        if (expires && expires > Date.now()) {
            const text = (process.env.COOLDOWN_MESSAGE ?? "Please wait <duration>.").replace(
                "<duration>",
                ms(expires - Date.now(), { long: true }),
            );
            await message.reply(text);
            return;
        }
        cooldowns.set(key, Date.now() + command.cooldown);
        setTimeout(() => cooldowns.delete(key), command.cooldown);
    }

    try {
        await command.execute(client, message, args);
    } catch (err) {
        logger.error(`Command ${command.name} has an error:`, err);
        await message.reply("❌ An error appeared while executing this command.").catch(() => {});
    }
});
