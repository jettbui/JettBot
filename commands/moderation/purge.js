const { globalResponses, purgeResponses } = require("../../json/responses.json");

module.exports = {
    name: "purge",
    description: "Clears messsages in the current channel",
    category: "moderation",
    aliases: ["prune", "clear"],
    permissions: ["MANAGE_MESSAGES"],
    args: true,
    usage: "<amount>",
    guildOnly: true,
    execute(message, args) {
        const amount = parseInt(args[0]);

        // validity checks
        if (isNaN(amount)) return message.channel.send(purgeResponses.invalidArgument);
        if (amount < 1 || amount > 50) return message.channel.send(purgeResponses.invalidRange);

        message.channel.bulkDelete(amount, true)
            .catch((error) => {
                console.error(error);
                message.channel.send(globalResponses.error);
            });
    },
};