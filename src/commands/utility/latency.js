module.exports = {
    name: "latency",
    description: "Get the bot latency",
    category: "utility",
    aliases: [],
    execute(message) {
        const clientPing = Math.round(message.client.ws.ping);
        const responsePing = Math.round(Date.now() - message.createdTimestamp);
        return message.channel.send(`Latency: **${clientPing}ms**\nResponse Time: **${responsePing}ms**`);
    },
};