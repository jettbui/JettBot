module.exports = {
	name: "userinfo",
    description: "Sends information about a user",
    category: "utility",
    aliases: [],
    args: false,
    usage: "[user]",
    cooldown: 5,
    guildOnly: false,
	execute(message, args) { // TODO
        const userEmbed = new Discord.MessageEmbed()
            .setColor("USER ROLE COLOR")
            .setTitle("User Info - USERNAME")
            .setThumbnail("USER ICON URL")
            .setFooter(informationalEmbed.footer.text)
            .setTimestamp()
            .addFields(
                { name: "ID", value: "" },
                { name: "Display Name", value: "" },
                { name: "Account Created", value: "" },
                { name: "Joined", value: "" },
                { name: "Roles", value: "" }
            );
        
        message.channel.send(userEmbed);
	},
};