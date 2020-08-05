module.exports = {
	name: "reload",
    description: "Reloads a command",
    category: "developer",
    aliases: [],
    args: true,
    usage: "<command name>",
    cooldown: 1,
    guildOnly: false,
	execute(message, args) {
        // command handler
        const commandName = args[0].toLowerCase();
        const command = message.client.commands.get(commandName)
	                    || message.client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

        if (!command) {
            message.channel.send("That command does not exist.");
            return;
        } 
        
        // reload command
        delete require.cache[require.resolve(`./${command.name}.js`)];

        try {
            const newCommand = require(`./${command.name}.js`);
            message.client.commands.set(newCommand.name, newCommand);
        } catch (error) {
            console.error("An error occurred reloading a command:", error);
            message.channel.send("There was an error while reloading the command.");
        }

        message.channel.send(`Reloaded "${command.name}"`);
	},
};