const { MessageEmbed } = require("discord.js"),
    fs = require("fs");
    ytdl = require("ytdl-core"),
    { prefix } = require("../../config.json"),
    { musictriviaEmbeds } = require("../../json/embeds.json"),
    { musictriviaResponses } = require("../../json/responses.json");

module.exports = {
    name: "musictrivia",
    description: "Start a music trivia quiz",
    category: "fun",
    aliases: ["mt"],
    args: false,
    guildOnly: true,
    execute(message, args) {
        const voiceChannel = message.member.voice.channel;
        const option = (args[0]) ? args[0].toLowerCase() : null;

        if (option === "stop") { // stop trivia if running
            if (!message.guild.triviaData.isTriviaRunning)
                return message.channel.send(musictriviaResponses.noTriviaRunning);
            if (message.guild.me.voice.channel !== message.member.voice.channel)
                return message.channel.send(musictriviaResponses.noVoiceChannel);
            if (!message.guild.triviaData.triviaScore.has(message.author.username))
                return message.channel.send(musictriviaResponses.isNotParticipating);

            message.guild.triviaData.triviaQueue.length = 0;
            message.guild.triviaData.wasTriviaEndCalled = true;
            message.guild.triviaData.triviaScore.clear();
            message.guild.musicData.songDispatcher.end();
            return message.channel.send(musictriviaResponses.triviaStopped);
        }

        // validity checks
        if (!voiceChannel) return message.channel.send(musictriviaResponses.noVoiceChannel);
        if (message.guild.triviaData.isTriviaRunning) return message.channel.send(musictriviaResponses.triviaRunning);

        const songsFile = fs.readFileSync("json/triviaSongs.json", "utf8");
        let songsArray = null;

        // parse options
        switch (option) {
            case "2020":
                songsArray = JSON.parse(songsFile)._2020; break;
            case "classics":
                songsArray = JSON.parse(songsFile).classics; break;
            default:
                songsArray = JSON.parse(songsFile).classics;
        }

        const randomSongs = this.getRandom(songsArray, 5);

        message.guild.musicData.isPlaying = true;
        message.guild.triviaData.isTriviaRunning = true;

        message.channel.send({ embed: musictriviaEmbeds.startEmbed });

        for (let i = 0; i < randomSongs.length; i++) {
            const song = {
                url: randomSongs[i].url,
                artist: randomSongs[i].artist,
                title: randomSongs[i].title,
                voiceChannel
            };
            message.guild.triviaData.triviaQueue.push(song);
        }

        const channelInfo = Array.from(message.member.voice.channel.members.entries());

        channelInfo.forEach((user) => {
            if (user[1].user.bot) return;
            message.guild.triviaData.triviaScore.set(user[1].user.username, 0);
        });

        this.playSong(message, message.guild.triviaData.triviaQueue);
    },
    playSong(message, triviaQueue) {
        triviaQueue[0].voiceChannel.join().then((connection) => {
            const dispatcher = connection
                .play(
                    ytdl(triviaQueue[0].url, {
                        quality: "highestaudio",
                        highWaterMark: 1024 * 1024 * 1024
                    })
                )
                .on("start", () => {
                    let songNameFound = false;
                    let songArtistFound = false;

                    message.guild.musicData.songDispatcher = dispatcher;
                    dispatcher.setVolume(message.guild.musicData.volume);

                    const filter = (m) => message.guild.triviaData.triviaScore.has(m.author.username);
                    const collector = message.channel.createMessageCollector(filter, { time: 30000 });

                    collector.on("collect", (m) => {
                        if (!message.guild.triviaData.triviaScore.has(m.author.username)) return;
                        if (m.content.startsWith(prefix)) return;

                        if (m.content.toLowerCase() === triviaQueue[0].title.toLowerCase()) {
                            if (songNameFound) return;

                            songNameFound = true;

                            if (songNameFound && songArtistFound) {
                                message.guild.triviaData.triviaScore.set(
                                    m.author.username,
                                    message.guild.triviaData.triviaScore.get(m.author.username) + 1
                                );
                                m.react('☑');
                                return collector.stop();
                            }
                            message.guild.triviaData.triviaScore.set(
                                m.author.username,
                                message.guild.triviaData.triviaScore.get(m.author.username) + 1
                            );
                            m.react('☑');
                        } else if (m.content.toLowerCase() === triviaQueue[0].artist.toLowerCase()) {
                            if (songArtistFound) return;

                            songArtistFound = true;

                            if (songNameFound && songArtistFound) {
                                message.guild.triviaData.triviaScore.set(
                                    m.author.username,
                                    message.guild.triviaData.triviaScore.get(m.author.username) + 1
                                );
                                m.react('☑');
                                return collector.stop();
                            }

                            message.guild.triviaData.triviaScore.set(
                                m.author.username,
                                message.guild.triviaData.triviaScore.get(m.author.username) + 1
                            );
                            m.react('☑');
                        } else if (m.content.toLowerCase() === triviaQueue[0].artist.toLowerCase() +
                            ' ' + triviaQueue[0].title.toLowerCase() ||
                            m.content.toLowerCase() === triviaQueue[0].title.toLowerCase() +
                            ' ' + triviaQueue[0].artist.toLowerCase()) {
                            if ((songArtistFound && !songNameFound) ||
                                (songNameFound && !songArtistFound)) {
                                message.guild.triviaData.triviaScore.set(
                                    m.author.username,
                                    message.guild.triviaData.triviaScore.get(m.author.username) + 1
                                );
                                m.react('☑');
                                return collector.stop();
                            }
                            message.guild.triviaData.triviaScore.set(
                                m.author.username,
                                message.guild.triviaData.triviaScore.get(m.author.username) + 2
                            );
                            m.react('☑');
                            return collector.stop();
                        }
                    });
                    collector.on("end", () => {
                        if (message.guild.triviaData.wasTriviaEndCalled) {
                            message.guild.triviaData.wasTriviaEndCalled = false;
                            return;
                        }

                        const sortedScoreMap = new Map(
                            [...message.guild.triviaData.triviaScore.entries()].sort(
                                (a, b) => b[1] - a[1]
                            )
                        );

                        const song = `${this.capitalize_Words(triviaQueue[0].artist)}: ${this.capitalize_Words(triviaQueue[0].title)}`;

                        const embed = new MessageEmbed()
                            .setColor(musictriviaEmbeds.answerEmbed.color)
                            .setTitle(`Answer: '${song}'`)
                            .setDescription(
                                this.getLeaderBoard(Array.from(sortedScoreMap.entries()))
                            );

                        message.channel.send(embed);
                        triviaQueue.shift();
                        dispatcher.end();
                        return;
                    })

                })
                .on("finish", () => {
                    if (triviaQueue.length >= 1) { // continue if more songs
                        return this.playSong(message, triviaQueue);
                    } else { // no songs
                        if (message.guild.triviaData.wasTriviaEndCalled) { // if the end-trivia command was called
                            message.guild.musicData.isPlaying = false;
                            message.guild.triviaData.isTriviaRunning = false;
                            message.guild.me.voice.channel.leave();
                            return;
                        }

                        const sortedScoreMap = new Map( // sort final score Map
                            [...message.guild.triviaData.triviaScore.entries()].sort(
                                (a, b) => b[1] - a[1]
                            )
                        );

                        const embed = new MessageEmbed()
                            .setColor("#0099ff")
                            .setTitle(musictriviaEmbeds.resultsEmbed.title)
                            .setDescription(
                                this.getLeaderBoard(Array.from(sortedScoreMap.entries()))
                            );
                        message.channel.send(embed);
                        message.guild.musicData.isPlaying = false;
                        message.guild.triviaData.isTriviaRunning = false;
                        message.guild.triviaData.triviaScore.clear();
                        message.guild.me.voice.channel.leave();
                        return;
                    }
                });
        });
    },
    getRandom(arr, n) {
        let result = new Array(n),
            len = arr.length,
            taken = new Array(len);
        if (n > len)
            throw new RangeError('getRandom: more elements taken than available');
        while (n--) {
            var x = Math.floor(Math.random() * len);
            result[n] = arr[x in taken ? taken[x] : x];
            taken[x] = --len in taken ? taken[len] : len;
        }
        return result;
    },
    getLeaderBoard(arr) {
        if (!arr) return;
        let leaderBoard = '';

        leaderBoard = `👑   **${arr[0][0]}:** ${arr[0][1]}  points`;

        if (arr.length > 1) {
            for (let i = 1; i < arr.length; i++) {
                leaderBoard =
                    leaderBoard + `\n   ${arr[i][0]}: ${arr[i][1]}  points`;
            }
        }
        return leaderBoard;
    },
    capitalize_Words(str) {
        return str.replace(/\w\S*/g, (txt) => {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        });
    }
};