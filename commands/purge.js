module.exports = {
	name: "purge",
    description: "Clears messsages in the current channel",
    category: "moderation",
    aliases: ["prune", "clear"],
    args: true,
    usage: "<amount>",
    guildOnly: true,
	execute(message, args) {
        let amount = parseInt(args[0]);

        // validity checks
        if (isNaN(amount)) {
            message.channel.send(`Invalid arguments provided.\nUsage: ${prefix}${command.name} ${command.usage}`)
            return;
        }

        amount = ((amount < 1) ? 1 : (amount > 100) ? 100 : amount) + 1;

        message.channel.bulkDelete(amount, true)
            .catch((err) => {
                console.error(err);
                message.channel.send("There was an error while trying to purge.");
            });
	},
};