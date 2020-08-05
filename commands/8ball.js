module.exports = {
	name: "8ball",
    description: "Ask the Magic 8Ball a question",
    category: "fun",
    aliases: [],
    args: true,
    usage: "<question>",
    guildOnly: false,
	execute(message, args) {
        const responses = ["For sure.",
                           "YEP",
                           "Probably.",
                           "I think so.",
                           "Maybe... maybe not.",
                           "I don't even know.",
                           "Probably not.",
                           "I don't think so.",
                           "No.",
                           "DEFINITELY NOT."];
        const question = args.join(" ");
        const response = responses[Math.floor(Math.random() * responses.length)];

        message.channel.send(`**Question:** _${question}_\n**<:8ball:734976384782565447>:** ${response}`)
	},
};