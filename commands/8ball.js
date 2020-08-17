const responses = require("../json/responses.json");

module.exports = {
	name: "8ball",
    description: "Ask the Magic 8Ball a question",
    category: "fun",
    aliases: [],
    args: true,
    usage: "<question>",
    guildOnly: false,
	execute(message, args) {
        const replies = responses._8ball.replies;
        const question = args.join(" ");
        const response = replies[Math.floor(Math.random() * replies.length)];

        message.channel.send(`**Question:** _${question}_\n**<:8ball:734976384782565447>:** ${response}`)
	},
};