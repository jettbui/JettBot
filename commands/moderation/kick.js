const { MessageEmbed } = require("discord.js"),
    { globalEmbed } = require("../../json/embeds.json"),
    { kickResponses } = require("../../json/responses.json");

module.exports = {
    name: "kick",
    description: "Kick a member",
    category: "moderation",
    aliases: [],
    permissions: ["KICK_MEMBERS"],
    args: true,
    usage: "<user> [reason]",
    cooldown: 8,
    guildOnly: true,
    execute(message, args) {
        const user = message.mentions.users.first();
        let reason = args.slice(1).join(" ");

        // validity checks
        if (!user) return message.channel.send(kickResponses.invalidUser);
        if (user === message.author) return message.channel.send(kickResponses.selfUser);
        if (!message.guild.member(user).kickable) return message.channel.send(kickResponses.noPermission);
        if (!reason) reason = "No reason provided";

        const member = message.guild.member(user);

        member.kick(reason)
            .then(() => {
                const embed = new MessageEmbed()
                    .setColor(globalEmbed.color)
                    .setTitle(`Kicked ${user.tag}`)
                    .setThumbnail(user.displayAvatarURL())
                    .setFooter(`Kicked by ${message.author.username}`, message.author.avatarURL());
                
                if (reason !== "No reason provided") embed.addField("Reason", reason);

                return message.channel.send(embed);
            });
    },
};