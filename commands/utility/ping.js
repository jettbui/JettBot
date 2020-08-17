module.exports = {
    name: "ping",
    description: "Returns a pong message",
    category: "utility",
    aliases: [],
    args: false,
    guildOnly: true,
    execute(message) {
        message.channel.send("Pong.");
    },
};