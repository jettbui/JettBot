module.exports = {
	name: "flip",
    description: "Flip a coin",
    category: "fun",
    aliases: ["coin"],
    args: false,
    guildOnly: false,
	execute(message, args) {
        const responses = ["**<:orange_circle:735583801249497138> Heads.**",
                           "**<:blue_circle:735725260321718302> Tails.**"];
        const response = responses[Math.floor(Math.random() * responses.length)];

        message.channel.send(response);
	},
};