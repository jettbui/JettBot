const { MessageEmbed } = require("discord.js"),
    { globalEmbed, aboutEmbed } = require("../../json/embeds.json");

module.exports = {
    name: "about",
    description: "Send information about JettBot",
    category: "informational",
    aliases: ["info", "bot"],
    args: false,
    execute(message) {
        const embed = new MessageEmbed()
            .setColor(globalEmbed.color)
            .setAuthor(globalEmbed.author.name)
            .setThumbnail(globalEmbed.thumbnail.url)
            .setFooter(globalEmbed.footer.text)
            .setDescription(aboutEmbed.description)
            .addFields(aboutEmbed.fields);

        return message.channel.send(embed);
    },
};