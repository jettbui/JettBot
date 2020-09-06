const { MessageEmbed } = require("discord.js"),
    { _8ballResponses } = require("../../json/responses.json"),
    { globalEmbed } = require("../../json/embeds.json");

module.exports = {
    name: "8ball",
    description: "Ask the Magic 8Ball a question",
    category: "fun",
    aliases: [],
    args: true,
    usage: "<question>",
    exampleUsage: "8ball Will it rain tomorrrow?",
    execute(message, args) {
        const question = args.join(" ");
        const answers = _8ballResponses.answers;
        const answer = answers[Math.floor(Math.random() * answers.length)];
        const embed = new MessageEmbed()
            .setColor(globalEmbed.color)
            .setTitle(`🎱   ${question}`)
            .setDescription(`**Answer:** ${answer}`);

        return message.channel.send(embed);
    },
};