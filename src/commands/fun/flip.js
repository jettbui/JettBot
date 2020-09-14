const { MessageEmbed } = require("discord.js"),
    { flipResponses } = require("../../json/responses.json"),
    { globalEmbed } = require("../../json/embeds.json");

module.exports = {
    name: "flip",
    description: "Flip a coin",
    category: "fun",
    aliases: ["coin"],
    args: false,
    execute(message) {
        const answers = flipResponses.answers;
        const answer = answers[Math.floor(Math.random() * answers.length)];
        const embed = new MessageEmbed()
            .setColor(globalEmbed.color)
            .setTitle("💿   Flipped a coin")
            .setDescription(`**Answer:** ${answer}`);

        return message.channel.send(embed);
    },
};