module.exports = {
    name: "send",
    description: "Send a message to a channel (developer only)",
    aliases: [],
    minArgs: 2,
    usage: "<channel ID> <message>",
    devOnly: true,
    execute(message, args) {
        const channel = message.client.channels.cache.get(args.shift());
        const msg = args.join(" ");

        // validity checks
        if (!channel || channel.type !== "text") return message.channel.send("Invalid channel.");
        if (!msg) return message.channel.send("No message specified.");

        channel.send(msg);

        return message.channel.send(`Sent '${msg}' to ${channel.guild.name}: ${channel}`);
    },
};