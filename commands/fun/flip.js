const { flipResponses } = require("../../json/responses.json");

module.exports = {
	name: "flip",
    description: "Flip a coin",
    category: "fun",
    aliases: ["coin"],
    args: false,
    guildOnly: false,
	execute(message) {
        const answers = flipResponses.answers;
        const answer = answers[Math.floor(Math.random() * answers.length)];

        message.channel.send(answer);
	},
};