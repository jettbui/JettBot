module.exports = {
    name: "restart",
    description: "Request to restart the bot",
    aliases: [],
    args: false,
    guildOnly: false,
    cooldown: 45,
    execute(message) {
        const requester = message.author;
        const dev = message.client.users.cache.get(message.client.config.ownerId);

        dev.send(`Request from **${message.author.tag}** to restart the bot. __React__ to this message to indicate your response (15 seconds).`)
            .then((message) => {
                const filter = (reaction, user) => (
                    ["✅", "❌"].includes(reaction.emoji.name) &&
                    user.id !== message.client.user.id
                );

                const collector = message.createReactionCollector(filter, { time: 15000 })
                    .on("collect", (reaction) => {
                        if (reaction.emoji.name == "✅") {
                            requester.send("Your request to restart the bot was accepted.");
                        } else {
                            requester.send("Your request to restart the bot was declined.");
                        }
                        dev.send("Response sent!");
                        collector.stop();
                    });

                message.react("✅");
                message.react("❌");
            });

        return message.channel.send("Your request to restart the bot has been submitted.");
    },
};