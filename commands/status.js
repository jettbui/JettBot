module.exports = {
    name: "status",
    description: "Changes the status of the bot (developer only)",
    aliases: [],
    args: true,
    usage: "<message>",
    guildOnly: false,
    devOnly: true,
    execute(message, args) {
        let status = args.join(" ");
        message.client.user.setActivity(status, { type: "PLAYING" });
        message.channel.send(`Status changed to '${status}'`);
    },
};