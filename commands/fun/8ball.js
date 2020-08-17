const { _8ballResponses } = require("../../json/responses.json");

module.exports = {
    name: "8ball",
    description: "Ask the Magic 8Ball a question",
    category: "fun",
    aliases: [],
    args: true,
    usage: "<question>",
    guildOnly: false,
    execute(message, args) {
        const answers = _8ballResponses.answers;
        const question = args.join(" ");
        const answer = answers[Math.floor(Math.random() * answers.length)];

        message.channel.send(`**Question:** _${question}_\n**<:8ball:734976384782565447>:** ${answer}`);
    },
};