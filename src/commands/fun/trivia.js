const { MessageEmbed } = require("discord.js"),
    triviaQuestions = require("../../json/triviaQuestions.json"),
    { globalEmbed, triviaEmbeds: { resultsEmbed, startEmbed } } = require("../../json/embeds.json"),
    { triviaResponses } = require("../../json/responses.json");

module.exports = {
    name: "trivia",
    description: "Start a trivia",
    category: "fun",
    aliases: [],
    args: false,
    usage: "[stop/option]",
    guildOnly: true,
    disabled: true,
    execute(message, args) {
        const textChannel = message.channel;
        const option = (args[0]) ? args[0].toLowerCase() : null;
        const embed = new MessageEmbed()
            .setColor(globalEmbed.color)
            .setTitle(startEmbed.title)
            .setDescription(startEmbed.description);
        let questionsArray = null;

        if (option === "stop") { // stop trivia if running
            if (!message.guild.triviaData.isTriviaRunning)
                return message.channel.send(triviaResponses.noTriviaRunning);
            if (message.guild.me.voice.channel !== message.member.voice.channel)
                return message.channel.send(triviaResponses.noVoiceChannel);
            if (!message.guild.triviaData.triviaScore.has(message.author.username))
                return message.channel.send(triviaResponses.isNotParticipating);

            message.guild.triviaData.triviaQueue.length = 0;
            message.guild.triviaData.wasTriviaEndCalled = true;
            message.guild.triviaData.triviaScore.clear();
            return message.channel.send(triviaResponses.triviaStopped);
        }

        // validity checks
        if (message.guild.triviaData.isTriviaRunning) return message.channel.send(triviaResponses.triviaRunning);

        message.guild.triviaData.isTriviaRunning = true;

        // parse options
        switch (option) {
            case "programming":
                questionsArray = triviaQuestions.programming; break;
            case "general":
                questionsArray = triviaQuestions.general; break;
            default:
                questionsArray = triviaQuestions.general;
        }

        const randomQuestions = this.getRandom(questionsArray, 5);

        message.channel.send(embed);

        for (let i = 0; i < randomQuestions.length; i++) {
            const question = {
                prompt: randomQuestions[i].prompt,
                answer: randomQuestions[i].answer,
                textChannel
            };
            message.guild.triviaData.triviaQueue.push(question);
        }

        const channelInfo = Array.from(textChannel.members.entries());

        channelInfo.forEach(user => {
            if (user[1].user.bot) return;
            message.guild.triviaData.triviaScore.set(user[1].user.username, 0);
        });

        this.nextQuestion(message, message.guild.triviaData.triviaQueue);
    },
    nextQuestion(message, triviaQueue) {
        const embed = new MessageEmbed()
            .setColor(globalEmbed.color)
            .setTitle(`Question: ${triviaQueue[0].prompt}`);

        triviaQueue[0].textChannel.send(embed);

        const filter = m => (
            message.guild.triviaData.triviaScore.has(m.author.username) &&
            !m.content.startsWith(message.client.config.prefix)
        );
        const collector = message.channel.createMessageCollector(filter, { time: 20000 })
            .on("collect", m => {
                if (m.content.toLowerCase() === triviaQueue[0].answer.toLowerCase()) {
                    message.guild.triviaData.triviaScore.set(
                        m.author.username,
                        message.guild.triviaData.triviaScore.get(m.author.username) + 1
                    );
                    m.react("✔️");
                    return collector.stop();
                }
            })
            .on("end", () => {
                if (message.guild.triviaData.wasTriviaEndCalled) {
                    message.guild.triviaData.wasTriviaEndCalled = false;
                    return;
                }

                const sortedScoreMap = new Map(
                    [...message.guild.triviaData.triviaScore.entries()].sort((a, b) => b[1] - a[1])
                );
                
                embed
                    .setTitle(`Answer: '${triviaQueue[0].answer}'`)
                    .setDescription(this.getLeaderboard(Array.from(sortedScoreMap.entries())));
                
                message.channel.send(embed);
                triviaQueue.shift();

                if (triviaQueue.length >= 1) { // continue if more questions
                    return this.nextQuestion(message, triviaQueue);
                } else { // no questions
                    if (message.guild.wasTriviaEndCalled) { // end-trivia called
                        message.guild.triviaData.isTriviaRunning = false;
                        return;
                    }

                    const sortedScoreMap = new Map(
                        [...message.guild.triviaData.triviaScore.entries()].sort((a, b) => b[1] - a[1])
                    );

                    embed
                        .setTitle(resultsEmbed.title)
                        .setDescription(this.getLeaderboard(Array.from(sortedScoreMap.entries())));

                    message.guild.triviaData.isTriviaRunning = false;
                    message.guild.triviaData.triviaScore.clear();
                    return message.channel.send(embed);
                }
            });
    },
    getRandom(arr, n) {
        let result = new Array(n),
            len = arr.length,
            taken = new Array(len);
        if (n > len)
            throw new RangeError("getRandom: more elements taken than available");
        while (n--) {
            var x = Math.floor(Math.random() * len);
            result[n] = arr[x in taken ? taken[x] : x];
            taken[x] = --len in taken ? taken[len] : len;
        }
        return result;
    },
    getLeaderboard(arr) {
        if (!arr) return;
        let leaderboard = "";

        leaderboard = `👑   **${arr[0][0]}:** ${arr[0][1]} points`;

        if (arr.length > 1) {
            for (let i = 1; i < arr.length; i++) {
                leaderboard = leaderboard + `\n   ${arr[i][0]}: ${arr[i][1]} points`;
            }
        }
        return leaderboard;
    },
    capitalizeWords(str) {
        return str.replace(/\w\S*/g, txt => {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        });
    }
};