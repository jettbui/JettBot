const { MessageEmbed } = require("discord.js"),
    { globalEmbed } = require("../../json/embeds.json"),
    { banResponses } = require("../../json/responses.json");

module.exports = {
    name: "ban",
    description: "Ban a member",
    category: "moderation",
    aliases: [],
    permissions: ["BAN_MEMBERS"],
    args: true,
    usage: "<user> [reason]",
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
                const embed = new MessageEmbed()
                    .setColor(globalEmbed.color)
                    .setTitle(`Banned ${user.tag}`)
                    .setThumbnail(user.displayAvatarURL())
                    .setFooter(`Banned by ${message.author.username}`, message.author.avatarURL());
                
                if (reason !== "No reason provided") embed.addField("Reason", reason);

                return message.channel.send(embed);
            });
    },
};