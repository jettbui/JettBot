const { globalResponses, banResponses } = require("../../json/responses.json");

module.exports = {
    name: "ban",
    description: "Ban a member from the server",
    category: "moderation",
    aliases: [],
    permissions: ["BAN_MEMBERS"],
    args: true,
    usage: "<user>",
    cooldown: 8,
    guildOnly: true,
    execute(message, args) {
        const user = message.mentions.users.first();
        let reason = args.slice(1).join(" ");

        // validity checks
        if (!user) return message.channel.send(banResponses.invalidUser);
        if (user === message.author) return message.channel.send(banResponses.selfUser);
        if (!message.guild.member(user).bannable) return message.channel.send(banResponses.noPermission);
        if (!reason) reason = "No reason provided";

        const member = message.guild.member(user);

        member.ban({reason: reason})
            .then(() => {
                message.channel.send(`Banned ${user.tag}.`);
            })
            .catch((error) => {
                console.error(error);
                message.channel.send(globalResponses.error);
            });
    },
};