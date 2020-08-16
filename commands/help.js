const Discord = require("discord.js");
const { prefix, defaultCooldown } = require("../config.json");
const { generalEmbed, allEmbed, commandEmbed, customizationEmbed, funEmbed,
        informationalEmbed, moderationEmbed, utilityEmbed } = require("./embeds.json");

module.exports = {
	name: "help",
    description: "Sends available commands for JettBot",
    category: "informational",
    aliases: ["commands"],
    args: false,
    usage: "[command]",
    cooldown: 5,
    guildOnly: false,
	execute(message, args) {
        const { commands } = message.client;
        const categories = ["customization", "fun", "informational", "moderation", "utility"];

        // general
        if (!args.length) {
            message.author.send({embed: generalEmbed})
                .catch((error) => {
                    console.error("An error occurred with the help command.\n", error);
                    message.channel.send("It seems like you have DMs disabled.");
                });
            return;
        }

        // all
        if (args[0].toLowerCase() === "all") {
            const allCommandsEmbed = new Discord.MessageEmbed();
            const allCommands = commands.filter((cmd) => categories.includes(cmd.category));
            allCommandsEmbed   
                .setColor(allEmbed.color)
                .setAuthor(allEmbed.author.name, allEmbed.author.icon_url)
                .setTitle(allEmbed.title)
                .setFooter(allEmbed.footer.text);
            // dynamic attributes for embed
            for (const command of allCommands.array()) {
                if (command.usage) {
                    allCommandsEmbed
                        .addField(`${prefix}${command.name} ${command.usage}`, command.description, true)
                } else {
                    allCommandsEmbed
                        .addField(`${prefix}${command.name}`, command.description, true)
                }
            }
            message.author.send(allCommandsEmbed)
                .catch((error) => {
                    console.error(error);
                    message.channel.send("It seems like you have DMs disabled.");
                });
            return;
        }

        // categorical
        const category = args[0].toLowerCase();
        if (categories.includes(category)) {
            const categoricalEmbed = new Discord.MessageEmbed();
            let categoricalCommands;

            // static attributes for embed
            switch (category) {
                case "customization":
                    categoricalEmbed
                        .setColor(customizationEmbed.color)
                        .setAuthor(customizationEmbed.author.name, customizationEmbed.author.icon_url)
                        .setTitle(customizationEmbed.title)
                        .setFooter(customizationEmbed.footer.text);
                    categoricalCommands = commands.filter((cmd) => cmd.category === "customization");
                    break;
                case "fun":
                    categoricalEmbed
                        .setColor(funEmbed.color)
                        .setAuthor(funEmbed.author.name, funEmbed.author.icon_url)
                        .setTitle(funEmbed.title)
                        .setFooter(funEmbed.footer.text);
                    categoricalCommands = commands.filter((cmd) => cmd.category === "fun");
                    break;
                case "informational":
                    categoricalEmbed
                        .setColor(informationalEmbed.color)
                        .setAuthor(informationalEmbed.author.name, informationalEmbed.author.icon_url)
                        .setTitle(informationalEmbed.title)
                        .setFooter(informationalEmbed.footer.text);
                    categoricalCommands = commands.filter((cmd) => cmd.category === "informational");
                    break;
                case "moderation":
                    categoricalEmbed
                        .setColor(moderationEmbed.color)
                        .setAuthor(moderationEmbed.author.name, moderationEmbed.author.icon_url)
                        .setTitle(moderationEmbed.title)
                        .setFooter(moderationEmbed.footer.text);
                    categoricalCommands = commands.filter((cmd) => cmd.category === "moderation");
                    break;
                case "utility":
                    categoricalEmbed
                        .setColor(utilityEmbed.color)
                        .setAuthor(utilityEmbed.author.name, utilityEmbed.author.icon_url)
                        .setTitle(utilityEmbed.title)
                        .setFooter(utilityEmbed.footer.text);
                    categoricalCommands = commands.filter((cmd) => cmd.category === "utility");
                    break;
            }

            // dynamic attributes for embed
            for (const command of categoricalCommands.array()) {
                if (command.usage) {
                    categoricalEmbed
                        .addField(`${prefix}${command.name} ${command.usage}`, command.description, true)
                } else {
                    categoricalEmbed
                        .addField(`${prefix}${command.name}`, command.description, true)
                }
            }

            message.author.send(categoricalEmbed)
                .catch((error) => {
                    console.error(error);
                    message.channel.send("It seems like you have DMs disabled.");
                });
            return;
        }

        // individual
        const name = args[0].toLowerCase();
        const command = commands.get(name) || commands.find((c) => c.aliases && c.aliases.includes(name));

        if (!command) return message.channel.send("That command does not exist.");;

        const individualEmbed = new Discord.MessageEmbed()
            .setColor(commandEmbed.color)
            .setAuthor(commandEmbed.author.name, commandEmbed.author.icon_url)
            .setFooter(commandEmbed.footer.text)
            .setTitle(command.name)
            .addField("Description", command.description);
        if (command.usage) individualEmbed.addField("Arguments", `${prefix}${command.name} ${command.usage}`);
        if (command.aliases.length) individualEmbed.addField("Aliases", command.aliases.join(", "));
        individualEmbed.addField("Cooldown", `${command.cooldown || defaultCooldown} second(s)`);

        message.channel.send(individualEmbed);
	},
};