module.exports = {
    name: "send",
    description: "Send a message to a channel (developer only)",
    aliases: [],
    args: true,
    usage: "<channel ID> <message>",
    guildOnly: false,
    devOnly: true,
    execute(message, args) {
        const channel = message.client.channels.cache.get(args[0]);
        const msg = args.splice(1).join(" ");

        // validity checks
        if (!channel) return message.channel.send("Invalid channel.");
        if (!msg) return message.channel.send("No message specified.");

        channel.send(msg);

        return message.channel.send(`Sent '${msg}' to ${channel.guild.name}: ${channel}`);
    },
};