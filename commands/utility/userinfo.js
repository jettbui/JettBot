const Discord = require("discord.js"),
    moment = require("moment-timezone"),
    { userEmbed } = require("../../json/embeds.json"),
    { userinfoResponses } = require("../../json/responses.json");

module.exports = {
    name: "userinfo",
    description: "Sends information about a user",
    category: "utility",
    aliases: ["user"],
    args: false,
    usage: "[user]",
    cooldown: 5,
    guildOnly: false,
    execute(message, args) {

        const user = (args[0]) ? message.mentions.users.first() : message.author;
        const member = message.guild.member(user);

        // validity checks
        if (!member) return message.channel.send(userinfoResponses.invalidUser);

        const userRoles = [];
        member.roles.cache.forEach((r) => {
            if (r != message.guild.roles.everyone.id) userRoles.push(r);
        });

        const embed = new Discord.MessageEmbed()
            .setColor((member.displayHexColor != "#000000") ? member.displayHexColor : "#969c9f")
            .setTitle(`User Info - ${user.tag}`)
            .setThumbnail(user.displayAvatarURL())
            .setFooter(userEmbed.footer.text)
            .setTimestamp()
            .addFields(
                { 
                    name: "Display Name", 
                    value: member.displayName, 
                    inline: true 
                },
                { 
                    name: "ID", 
                    value: member.id, 
                    inline: true
                },
                {
                    name: "Account Created",
                    value: moment.tz(user.createdAt, "America/Los_Angeles").format("MMMM DD, YYYY [at] h:mm A [(PST)]")
                },
                {
                    name: "Joined",
                    value: moment.tz(member.joinedAt, "America/Los_Angeles").format("MMMM DD, YYYY [at] h:mm A [(PST)]")
                },
                { 
                    name: "Roles", 
                    value: (userRoles.length > 0) ? userRoles.join(", ") : "None"
                }
            );

        message.channel.send(embed);
    },
};