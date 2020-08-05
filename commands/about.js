const { aboutEmbed } = require("./embeds.json");

module.exports = {
	name: "about",
    description: "Sends information about JettBot",
    category: "informational",
    aliases: ["info"],
    args: false,
    guildOnly: false,
	execute(message, args) {
        message.channel.send({embed: aboutEmbed});
	},
};