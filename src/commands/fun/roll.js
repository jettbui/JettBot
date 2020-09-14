const { MessageEmbed } = require("discord.js"),
    { rollResponses } = require("../../json/responses.json"),
    { globalEmbed } = require("../../json/embeds.json");

module.exports = {
    name: "roll",
    description: "Roll a dice",
    category: "fun",
    aliases: ["dice"],
    args: false,
    execute(message) {
        const answers = rollResponses.answers;
        const answer = answers[Math.floor(Math.random() * answers.length)];
        const embed = new MessageEmbed()
            .setColor(globalEmbed.color)
            .setTitle("🎲   Rolled a dice")
            .setDescription(`**Answer:** ${answer}`);

        return message.channel.send(embed);
    },
};