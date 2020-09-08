module.exports = {
    name: "status",
    description: "Change the bot status (developer only)",
    aliases: [],
    args: true,
    usage: "<type> <status>",
    guildOnly: false,
    devOnly: true,
    execute(message, args) {
        let type = parseInt(args.shift());
        const status = args.join(" ");

        // validity checks
        if (isNaN(type)) return message.channel.send("Type must be a number.");

        switch (type) {
            case 0: type = "PLAYING"; break;
            case 1: type = "LISTENING"; break;
            case 2: type = "WATCHING"; break;
            default: type = "PLAYING";
        }

        message.client.user.setActivity(status, { type: type });
        return message.channel.send(`Status changed to '${status}'`);
    },
};