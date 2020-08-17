const { rollResponses } = require("../../json/responses.json");

module.exports = {
    name: "roll",
    description: "Roll a dice",
    category: "fun",
    aliases: ["dice"],
    args: false,
    guildOnly: false,
    execute(message) {
        const answers = rollResponses.answers;
        const answer = answers[Math.floor(Math.random() * answers.length)];

        message.channel.send(answer);
    },
};