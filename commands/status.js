module.exports = {
    name: "status",
    description: "Change the status of the bot (developer only)",
    aliases: [],
    args: true,
    usage: "<status>",
    guildOnly: false,
    devOnly: true,
    execute(message, args) {
        const status = args.join(" ");
        message.client.user.setActivity(status, { type: "PLAYING" });
        return message.channel.send(`Status changed to '${status}'`);
    },
};