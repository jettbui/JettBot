module.exports = {
    name: "analytics",
    description: "Sends analytics about the bot (developer only)",
    aliases: [],
    args: false,
    guildOnly: false,
    devOnly: true,
    execute(message, args) {
        message.channel.send("Invalid channel.");
    },
};