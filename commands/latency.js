module.exports = {
	name: "latency",
    description: "Returns the latency of the bot",
    category: "utility",
    aliases: [],
    args: false,
    guildOnly: true,
	execute(message, args) {
        const clientPing = Math.round(message.client.ws.ping);
        const responsePing = Math.round(Date.now() - message.createdTimestamp);
		message.channel.send(`Latency: **${clientPing}ms**\nResponse Time: **${responsePing}ms**`);
	},
};