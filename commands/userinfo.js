const Discord = require("discord.js");
const moment = require("moment");
const momentTz = require("moment-timezone");

module.exports = {
	name: "userinfo",
    description: "Sends information about a user",
    category: "utility",
    aliases: [],
    args: false,
    usage: "[user]",
    cooldown: 5,
    guildOnly: false,
    execute(message, args) {

        const user = (args[0]) ? message.mentions.users.first() : message.author;
        const member = message.guild.member(user);

        // validity checks
        if (!member) return message.channel.send("That user does not exist.");

        const userEmbed = new Discord.MessageEmbed()
            .setColor(member.displayHexColor)
            .setTitle(`User Info - ${user.tag}`)
            .setThumbnail(user.displayAvatarURL())
            .setFooter("Copyright JettBot, © 2020")
            .setTimestamp()
            .addFields(
                { name: "ID", value: member.id },
                { name: "Display Name", value: member.displayName },
                { name: "Account Created",
                  value: moment.tz(user.createdAt, "America/Los_Angeles").format("MMMM DD, YYYY [at] h:mm A [(PST)]") },
                { name: "Joined",
                  value: moment.tz(member.joinedAt, "America/Los_Angeles").format("MMMM DD, YYYY [at] h:mm A [(PST)]") },
                //{ name: "Roles", value: member.roles.map((r) => `${r}`). join(", ") }
            );
        
        message.channel.send(userEmbed);
	},
};