module.exports = {
    name: "report",
    description: "Report issues/feedback with the bot",
    aliases: ["feedback"],
    args: true,
    usage: "<message>",
    guildOnly: false,
    execute(message, args) {
        const dev = message.client.users.cache.get(message.client.config.ownerId);
        const msg = args.join(" ");

        dev.send(`**Report from ${message.author.tag} (${message.guild}):** ${msg}`);

        return message.channel.send("Your report has been submitted. Thank you!");
    },
};