const { globalResponses, kickResponses } = require("../../json/responses.json");

module.exports = {
    name: "kick",
    description: "Kick a member from the server",
    category: "moderation",
    aliases: [],
    args: true,
    usage: "<user>",
    cooldown: 8,
    guildOnly: true,
    execute(message, args) {
        const user = message.mentions.users.first();
        let reason = args.slice(1).join(" ");

        // validity checks
        if (!message.member.hasPermission("KICK_MEMBERS")) return message.channel.send(kickResponses.invalidPermission);
        if (!user) return message.channel.send(kickResponses.invalidUser);
        if (user === message.author) return message.channel.send(kickResponses.selfUser);
        if (!message.guild.member(user).kickable) return message.channel.send(kickResponses.noPermission);
        if (!reason) reason = "No reason provided";

        const member = message.guild.member(user);

        member.kick(reason)
            .then(() => {
                message.channel.send(`Kicked ${user.tag}.`);
            })
            .catch((error) => {
                console.error(error);
                message.channel.send(globalResponses.error);
            });
    },
};