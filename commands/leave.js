module.exports = {
    name: "leave",
    description: "Leave a guild (developer only)",
    aliases: [],
    args: true,
    usage: "<server id>",
    guildOnly: false,
    devOnly: true,
    execute(message, args) {
        const guild = message.client.guilds.cache.get(args[0]);

        if (!guild) return message.channel.send("Invalid guild.")

        message.channel.send(`Left ${guild.name} (${guild.id}).`);
        guild.leave();
        return;
    },
};