module.exports = {
    name: "status",
    description: "Change the status of the bot (developer only)",
    aliases: [],
    args: true,
    usage: "<status>",
    guildOnly: false,
    devOnly: true,
    execute(message, args) {
        message.client.user.setActivity(args.join(" "), { type: "PLAYING" });
        return message.channel.send(`Status changed to '${status}'`);
    },
};