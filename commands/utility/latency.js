module.exports = {
    name: "latency",
    description: "Get the bot latency",
    category: "utility",
    aliases: [],
    args: false,
    execute(message) {
        const clientPing = Math.round(message.client.ws.ping);
        const responsePing = Math.round(Date.now() - message.createdTimestamp);
        message.channel.send(`Latency: **${clientPing}ms**\nResponse Time: **${responsePing}ms**`);
    },
};