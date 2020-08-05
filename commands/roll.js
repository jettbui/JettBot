module.exports = {
	name: "roll",
    description: "Roll a dice",
    category: "fun",
    aliases: ["dice"],
    args: false,
    guildOnly: false,
	execute(message, args) {
        const responses = ["<:one:735714655934349385> Rolled a **one**.",
                           "<:two:735714655934349385> Rolled a **two**.",
                           "<:three:735714655934349385> Rolled a **three**.",
                           "<:four:735714655934349385> Rolled a **four**.",
                           "<:five:735714655934349385> Rolled a **five**.",
                           "<:six:735714655934349385> Rolled a **six**."];
        const response = responses[Math.floor(Math.random() * responses.length)];

        message.channel.send(response);
	},
};