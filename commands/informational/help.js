const Discord = require("discord.js"),
    { prefix, defaultCooldown } = require("../../config.json"),
    { helpEmbeds: { allEmbed, commandEmbed, customizationEmbed, funEmbed,
        generalEmbed, informationalEmbed, moderationEmbed,
        musicEmbed, utilityEmbed } } = require("../../json/embeds.json"),
    { globalResponses, helpResponses } = require("../../json/responses.json");

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
        const categories = ["customization", "fun", "informational", "moderation", "music", "utility"];
        let category = (args[0]) ? args[0].toLowerCase() : null;

        // general
        if (!category) {
            return message.author.send({ embed: generalEmbed })
                .catch((error) => {
                    console.error(error);
                    return message.channel.send(helpResponses.error);
                });
        }

        const embed = new Discord.MessageEmbed();

        if (category === "all") { // all commands
            const allCommands = commands.filter((cmd) => categories.includes(cmd.category));

            embed
                .setColor(allEmbed.color)
                .setAuthor(allEmbed.author.name, allEmbed.author.icon_url)
                .setTitle(allEmbed.title)
                .setFooter(allEmbed.footer.text);

            for (const command of allCommands.array()) {
                if (command.usage)
                    embed
                        .addField(`${prefix}${command.name} ${command.usage}`, command.description, true);
                else
                    embed
                        .addField(`${prefix}${command.name}`, command.description, true);
            }
        } else if (categories.includes(category)) { // categorical
            let categoricalCommands = null;

            switch (category) {
                case "customization":
                    embed
                        .setColor(customizationEmbed.color)
                        .setAuthor(customizationEmbed.author.name, customizationEmbed.author.icon_url)
                        .setTitle(customizationEmbed.title)
                        .setFooter(customizationEmbed.footer.text);
                    categoricalCommands = commands.filter((cmd) => cmd.category === "customization");
                    break;
                case "fun":
                    embed
                        .setColor(funEmbed.color)
                        .setAuthor(funEmbed.author.name, funEmbed.author.icon_url)
                        .setTitle(funEmbed.title)
                        .setFooter(funEmbed.footer.text);
                    categoricalCommands = commands.filter((cmd) => cmd.category === "fun");
                    break;
                case "informational":
                    embed
                        .setColor(informationalEmbed.color)
                        .setAuthor(informationalEmbed.author.name, informationalEmbed.author.icon_url)
                        .setTitle(informationalEmbed.title)
                        .setFooter(informationalEmbed.footer.text);
                    categoricalCommands = commands.filter((cmd) => cmd.category === "informational");
                    break;
                case "moderation":
                    embed
                        .setColor(moderationEmbed.color)
                        .setAuthor(moderationEmbed.author.name, moderationEmbed.author.icon_url)
                        .setTitle(moderationEmbed.title)
                        .setFooter(moderationEmbed.footer.text);
                    categoricalCommands = commands.filter((cmd) => cmd.category === "moderation");
                    break;
                case "music":
                    embed
                        .setColor(musicEmbed.color)
                        .setAuthor(musicEmbed.author.name, musicEmbed.author.icon_url)
                        .setTitle(musicEmbed.title)
                        .setFooter(musicEmbed.footer.text);
                    categoricalCommands = commands.filter((cmd) => cmd.category === "music");
                    break;
                case "utility":
                    embed
                        .setColor(utilityEmbed.color)
                        .setAuthor(utilityEmbed.author.name, utilityEmbed.author.icon_url)
                        .setTitle(utilityEmbed.title)
                        .setFooter(utilityEmbed.footer.text);
                    categoricalCommands = commands.filter((cmd) => cmd.category === "utility");
                    break;
            }

            for (const command of categoricalCommands.array()) {
                if (command.usage)
                    embed
                        .addField(`${prefix}${command.name} ${command.usage}`, command.description, true);
                else
                    embed
                        .addField(`${prefix}${command.name}`, command.description, true);
            }
        } else { // individual
            const command = commands.get(category) || commands.find((c) => c.aliases && c.aliases.includes(category));

            if (!command) return message.channel.send(globalResponses.noCommand);

            embed
                .setColor(commandEmbed.color)
                .setAuthor(commandEmbed.author.name, commandEmbed.author.icon_url)
                .setFooter(commandEmbed.footer.text)
                .setTitle(command.name)
                .addField("Description", command.description, true);

            if (command.usage) embed.addField("Arguments", `${prefix}${command.name} ${command.usage}`, true);
            if (command.aliases.length) embed.addField("Aliases", command.aliases.join(", "), true);

            embed.addField("Cooldown", `${command.cooldown || defaultCooldown} second(s)`, true);
        }

        return message.author.send(embed)
            .catch((error) => {
                console.error(error);
                return message.channel.send(helpResponses.error);
            });
    },
};