const { MessageEmbed } = require("discord.js"),
    { pollResponses } = require("../../json/responses.json");

module.exports = {
    name: "poll",
    description: "Start a poll",
    category: "utility",
    aliases: [],
    args: true,
    usage: "<question> [options...]",
    exampleUsage: "poll \"What should I eat for dinner?\" \"Hamburger\" \"Pizza\" \"Spaghetti\"",
    guildOnly: true,
    async execute(message, args) {
        const options = new Map();
        const voteUsers = [];
        const interval = 15000; // interval to update timer (ms)
        let timer = 60000; // time to run poll (ms)

        const parsedArgs = this.extractArgs(args.join(" "));
        const question = parsedArgs.shift();
        const binaryVote = (!parsedArgs.length) ? true : false;

        const embed = new MessageEmbed()
            .setColor("#1abc9c")
            .setAuthor("Poll")
            .setTitle(question)
            .setFooter(`You can only vote once. (${timer / 1000} seconds left)`);

        // validity checks
        if (message.guild.isPollRunning) return message.channel.send(pollResponses.pollRunning);
        if (!binaryVote && !parsedArgs[1]) return message.channel.send(pollResponses.tooLittleOptions);
        if (!binaryVote && parsedArgs[10]) return message.channel.send(pollResponses.tooManyOptions);

        message.guild.isPollRunning = true;

        if (binaryVote) {
            options.set("✅", 0);
            options.set("❌", 0);
            parsedArgs.push("Yes", "No");
        } else {
            const emoteList = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣", "🔟"];
            let emoteIndex = 0;

            parsedArgs.forEach(() => {
                options.set(emoteList[emoteIndex], 0);
                emoteIndex = emoteIndex + 1;
            });

            embed.setDescription(this.getOptions(options, parsedArgs));
        }

        message.channel.send(embed)
            .then(message => {
                const filter = (reaction, user) => {
                    return (
                        options.has(reaction.emoji.name) &&
                        user.id !== message.client.user.id
                    );
                };
                const stopwatch = setInterval(() => {
                    timer = timer - interval;
                    embed.setFooter(`You can only vote once. (${timer / 1000} seconds left)`);
                    message.edit(embed);
                }, interval);

                message.createReactionCollector(filter, { time: timer })
                    .on("collect", (reaction, user) => {
                        if (voteUsers.includes(user.id)) return;
                        voteUsers.push(user.id);

                        const votes = options.get(reaction.emoji.name);
                        options.set(reaction.emoji.name, votes + 1);
                    })
                    .on("end", () => {
                        clearInterval(stopwatch);
                        embed
                            .setColor("#9b59b6")
                            .setDescription(this.getResults(options, parsedArgs, voteUsers))
                            .setFooter(`${voteUsers.length} ${(voteUsers.length == 1 ? "user" : "users")} voted`);
                        message.edit(embed);

                        message.guild.isPollRunning = false;
                    });

                options.forEach((value, key) => {
                    message.react(key);
                });
            })
            .catch((error) => {
                console.log(error);
                message.guild.isPollRunning = false;
            });
        return;
    },
    extractArgs(str) {
        const re = /"(.*?)"/g;
        const result = [];
        let current = re.exec(str);

        while (current) {
            result.push(current.pop());
            current = re.exec(str);
        }

        return result.length > 0 ? result : [str];
    },
    getOptions(options, parsedArgs) {
        let output = "";
        let optionsIndex = 0;
        
        options.forEach((value, key) => {
            output = output + `${key} ${parsedArgs[optionsIndex]}\n`;
            optionsIndex = optionsIndex + 1;
        });

        return output;
    },
    getResults(options, parsedArgs, voteUsers) {
        let output = "";
        let optionsIndex = 0;

        options.forEach((value) => {
            const percentageValue = (value / voteUsers.length) * 100;
            const percentage = (isNaN(percentageValue)) ? 0 : Math.round(percentageValue);
            output = output + `**${percentage}%** ${parsedArgs[optionsIndex]}\n`;
            optionsIndex = optionsIndex + 1;
        });

        return output;
    }
};