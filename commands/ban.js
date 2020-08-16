module.exports = {
	name: "ban",
    description: "Ban a member from the server",
    category: "moderation",
    aliases: [],
    args: true,
    usage: "<user>",
    cooldown: 8,
    guildOnly: true,
	execute(message, args) {
        let user = message.mentions.users.first();
        let reason = args.slice(1).join(" ");

        // validity checks
        if (!message.member.hasPermission("KICK_MEMBERS")) return message.channel.send("You do not have permission to ban users.");
        if (!user) return message.channel.send("User not found.");
        if (user === message.author) return message.channel.send("You cannot ban yourself.");
        if (!message.guild.member(user).bannable) return message.channel.send("I do not have permission to ban that user.");
        if (!reason) reason = "No reason provided";

        const member = message.guild.member(user);
        member.ban({reason: reason})
            .then(() => {
                message.channel.send(`Banned ${user.tag}.`);
            })
            .catch((error) => {
                message.channel.send("An error has occurred. Check logs for details.");
                console.log(error);
            });
	},
};