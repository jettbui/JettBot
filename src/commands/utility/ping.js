module.exports = {
    name: "ping",
    description: "Returns a pong message",
    category: "utility",
    aliases: [],
    execute(message) {
        return message.channel.send("Pong.");
    },
};