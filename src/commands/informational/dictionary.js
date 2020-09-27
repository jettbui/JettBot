const { MessageEmbed } = require("discord.js"),
    { globalEmbed } = require("../../json/embeds.json"),
    { dictionaryResponses } = require("../../json/responses.json"),
    fetch = require("node-fetch");

module.exports = {
    name: "dictionary",
    description: "TODO",
    category: "informational",
    aliases: ["word", "define", "definition", "dict"],
    args: true,
    usage: "<keywords>",
    execute(message, args) {
        const flDict = {
            "noun": "n.",
            "verb": "v.",
            "intransitive verb": "v.",
            "transitive verb": "v.",
            "adjective": "adj.",
            "adverb": "adv.",
            "exclamation": "exclamation"
        };

        const terms = args.join(" ");
        const url = `https://api.dictionaryapi.dev/api/v2/entries/en/${terms}`;
        const embed = new MessageEmbed()
            .setColor(globalEmbed.color)
            .setFooter("Click to cycle definitions • JettBot");

        fetch(url)
            .then((res) => res.json())
            .then((body) => {
                // validity checks
                if (body.title == "No Definitions Found") return message.channel.send(dictionaryResponses.noResult);

                // retrieve data
                const data = body[0];
                let meaningIndex = 0;
                let definitionIndex = 0;

                const word = data.word;
                const phonetics = data.phonetics.map(p => p.text).join(", ");
                let partOfSpeech = flDict[data.meanings[meaningIndex].partOfSpeech];
                let definition = data.meanings[meaningIndex].definitions[definitionIndex].definition;
                let example = data.meanings[meaningIndex].definitions[definitionIndex].example;
                let synonyms = (data.meanings[meaningIndex].definitions[definitionIndex].synonyms) ?
                    data.meanings[meaningIndex].definitions[definitionIndex].synonyms.slice(0, 3) : null;

                embed
                    .setTitle(`${word} (${partOfSpeech}) [${meaningIndex + 1} out of ${data.meanings.length}]`)
                    .setDescription(phonetics)
                    .addField("Definition", `[${definitionIndex + 1}/${data.meanings[meaningIndex].definitions.length}] ${definition}`);
                if (example) embed.addField("Example", example, true);
                if (synonyms) embed.addField("Synonyms", synonyms.join(", "), true);

                message.channel.send(embed)
                    .then((message) => {
                        const filter = (reaction, user) => {
                            return (
                                ["⏭", "⏩"].includes(reaction.emoji.name) &&
                                user.id !== message.author.id
                            );
                        };

                        const collector = message.createReactionCollector(filter, { time: 60000, dispose: true })
                            .on("collect", (reaction) => {
                                if (reaction.emoji.name == "⏭") {
                                    meaningIndex = (meaningIndex == data.meanings.length - 1) ?
                                        0 : meaningIndex + 1;
                                    definitionIndex = 0;
                                }
                                if (reaction.emoji.name == "⏩") {
                                    definitionIndex = (definitionIndex ==
                                        data.meanings[meaningIndex].definitions.length - 1) ?
                                        0 : definitionIndex + 1;
                                }

                                partOfSpeech = flDict[data.meanings[meaningIndex].partOfSpeech];
                                definition = data.meanings[meaningIndex].definitions[definitionIndex].definition;
                                example = data.meanings[meaningIndex].definitions[definitionIndex].example;
                                synonyms = (data.meanings[meaningIndex].definitions[definitionIndex].synonyms) ?
                                    data.meanings[meaningIndex].definitions[definitionIndex].synonyms.slice(0, 3) : null;

                                embed.fields = [];
                                embed
                                    .setTitle(`${word} (${partOfSpeech}) [${meaningIndex + 1} out of ${data.meanings.length}]`)
                                    .setDescription(phonetics)
                                    .addField("Definition", `[${definitionIndex + 1}/${data.meanings[meaningIndex].definitions.length}] ${definition}`);
                                if (example) embed.addField("Example", example, true);
                                if (synonyms) embed.addField("Synonyms", synonyms.join(", "), true);

                                message.edit(embed);
                            })
                            .on("remove", (reaction, user) => {
                                collector.emit("collect", reaction, user);
                            })
                            .on("end", () => {
                                message.reactions.removeAll();
                                
                                embed
                                    .setTitle(`${word} (${partOfSpeech})`)
                                    .setFooter("Provided by Google Dictionary API • JettBot");
                                embed.fields[0].value = definition;

                                message.edit(embed);
                            });

                        message.react("⏭");
                        message.react("⏩");
                    })
                    .catch((error) => {
                        console.log(error);
                    });

                return;
            });
    },
};
