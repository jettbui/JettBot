const { MessageEmbed } = require("discord.js"),
    { globalEmbed, helpEmbeds: { allEmbed, commandEmbed, funEmbed,
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
    execute(message, args) {
        const { commands } = message.client;
        const categories = ["fun", "informational", "moderation", "music", "utility"];
        let category = (args[0]) ? args[0].toLowerCase() : null;

        const embed = new MessageEmbed()
            .setColor(globalEmbed.color)
            .setAuthor(globalEmbed.author.name, globalEmbed.author.icon_url)
            .setFooter(globalEmbed.footer.text);

        if (!category) { // general
            embed
                .setTitle(generalEmbed.title)
                .addFields(generalEmbed.fields);
        } else if (category === "all") { // all commands
            const allCommands = commands.filter((cmd) => categories.includes(cmd.category) && !cmd.disabled);
            const sortedCommands = allCommands.array().sort((a, b) => {
                const aLetter = a.name.toLowerCase();
                const bLetter = b.name.toLowerCase();
                return (aLetter < bLetter) ? -1 : (aLetter > bLetter) ? 1 : 0;
            });
    
            embed
                .setTitle(allEmbed.title);

            for (const command of sortedCommands) {
                if (command.usage)
                    embed.addField(`${message.client.config.prefix}${command.name} ${command.usage}`,
                        command.description, true);
                else
                    embed.addField(`${message.client.config.prefix}${command.name}`,
                        command.description, true);
            }
        } else if (categories.includes(category)) { // categorical
            let categoricalCommands = null;

            switch (category) {
                case "fun":
                    embed
                        .setColor(funEmbed.color)
                        .setTitle(funEmbed.title);
                    categoricalCommands = commands.filter((cmd) => cmd.category === "fun" && !cmd.disabled);
                    break;
                case "informational":
                    embed
                        .setColor(informationalEmbed.color)
                        .setTitle(informationalEmbed.title);
                    categoricalCommands = commands.filter((cmd) => cmd.category === "informational" && !cmd.disabled);
                    break;
                case "moderation":
                    embed
                        .setColor(moderationEmbed.color)
                        .setTitle(moderationEmbed.title);
                    categoricalCommands = commands.filter((cmd) => cmd.category === "moderation" && !cmd.disabled);
                    break;
                case "music":
                    embed
                        .setColor(musicEmbed.color)
                        .setTitle(musicEmbed.title);
                    categoricalCommands = commands.filter((cmd) => cmd.category === "music" && !cmd.disabled);
                    break;
                case "utility":
                    embed
                        .setColor(utilityEmbed.color)
                        .setTitle(utilityEmbed.title);
                    categoricalCommands = commands.filter((cmd) => cmd.category === "utility" && !cmd.disabled);
                    break;
            }

            for (const command of categoricalCommands.array()) {
                if (command.usage)
                    embed.addField(`${message.client.config.prefix}${command.name} ${command.usage}`,
                        command.description, true);
                else
                    embed.addField(`${message.client.config.prefix}${command.name}`,
                        command.description, true);
            }
        } else { // individual
            const command = commands.get(category) || commands.find((c) => c.aliases && c.aliases.includes(category));

            if (!command) return message.channel.send(globalResponses.noCommand);

            embed
                .setColor(commandEmbed.color)
                .setTitle(command.name)
                .addField("Description", command.description, false);

            if (command.usage)
                embed.addField("Usage",
                    `${message.client.config.prefix}${command.name} ${command.usage}`, false);
            if (command.exampleUsage)
                embed.addField("Example Usage", `${message.client.config.prefix}${command.exampleUsage}`);
            if (command.aliases.length)
                embed.addField("Aliases",
                    command.aliases.join(", "), true);

            embed.addField("Cooldown", `${command.cooldown || message.client.config.defaultCooldown} second(s)`, true);

            return message.channel.send(embed)
                .catch((error) => {
                    console.error(error);
                    return message.channel.send(helpResponses.error);
                });
        }

        return message.author.send(embed)
            .catch((error) => {
                console.error(error);
                return message.channel.send(helpResponses.error);
            });
    },
    alphabetize(arr) {
        return Object.values(
            arr.reduce((acc, word) => {
                let firstLetter = word.name[0].toLocaleUpperCase();
                console.log(firstLetter);
                if (!acc[firstLetter])
                    acc[firstLetter] = { title: firstLetter, data: [word] };
                else
                    acc[firstLetter].data.push(word);
                return acc;
            }, {})
        );
    },
};