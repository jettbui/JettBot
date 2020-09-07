const { MessageEmbed } = require("discord.js"),
    ytdl = require("ytdl-core"),
    triviaSongs = require("../../json/triviaSongs.json"),
    { globalEmbed, musictriviaEmbeds: { resultsEmbed, startEmbed } } = require("../../json/embeds.json"),
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
        const embed = new MessageEmbed()
            .setColor(globalEmbed.color)
            .setTitle(startEmbed.title)
            .setDescription(startEmbed.description);
        let songsArray = null;

        if (option === "stop") { // stop trivia if running
            if (!message.guild.musicTriviaData.isTriviaRunning)
                return message.channel.send(musictriviaResponses.noTriviaRunning);
            if (message.guild.me.voice.channel !== message.member.voice.channel)
                return message.channel.send(musictriviaResponses.noVoiceChannel);
            if (!message.guild.musicTriviaData.triviaScore.has(message.author.username))
                return message.channel.send(musictriviaResponses.isNotParticipating);

            message.guild.musicTriviaData.triviaQueue.length = 0;
            message.guild.musicTriviaData.wasTriviaEndCalled = true;
            message.guild.musicTriviaData.triviaScore.clear();
            message.guild.musicData.songDispatcher.end();
            return message.channel.send(musictriviaResponses.triviaStopped);
        }

        // validity checks
        if (!voiceChannel) return message.channel.send(musictriviaResponses.noVoiceChannel);
        if (message.guild.musicTriviaData.isTriviaRunning) return message.channel.send(musictriviaResponses.triviaRunning);

        message.guild.musicData.isPlaying = true;
        message.guild.musicTriviaData.isTriviaRunning = true;

        // parse options
        switch (option) {
            case "2020":
                songsArray = triviaSongs._2020; break;
            case "classics":
                songsArray = triviaSongs.classics; break;
            default:
                songsArray = triviaSongs.classics;
        }

        const randomSongs = this.getRandom(songsArray, 5);

        message.channel.send(embed);

        for (let i = 0; i < randomSongs.length; i++) {
            const song = {
                url: randomSongs[i].url,
                artist: randomSongs[i].artist,
                title: randomSongs[i].title,
                voiceChannel
            };
            message.guild.musicTriviaData.triviaQueue.push(song);
        }

        const channelInfo = Array.from(message.member.voice.channel.members.entries());

        channelInfo.forEach(user => {
            if (user[1].user.bot) return;
            message.guild.musicTriviaData.triviaScore.set(user[1].user.username, 0);
        });

        this.playSong(message, message.guild.musicTriviaData.triviaQueue);
    },
    playSong(message, triviaQueue) {
        const embed = new MessageEmbed()
            .setColor(globalEmbed.color);

        triviaQueue[0].voiceChannel
            .join()
            .then(connection => {
                const dispatcher = connection
                    .play(ytdl(triviaQueue[0].url, { quality: "highestaudio", highWaterMark: 1024 * 1024 * 1024 }))
                    .on("start", () => {
                        let songNameFound = false;
                        let songArtistFound = false;

                        message.guild.musicData.songDispatcher = dispatcher;
                        dispatcher.setVolume(message.guild.musicData.volume);

                        const filter = m => (
                            message.guild.musicTriviaData.triviaScore.has(m.author.username) &&
                            !m.content.startsWith(message.client.config.prefix)
                        );
                        const collector = message.channel.createMessageCollector(filter, { time: 30000 })
                            .on("collect", m => {
                                if (m.content.toLowerCase() === triviaQueue[0].title.toLowerCase()) {
                                    if (songNameFound) return;
                                    
                                    songNameFound = true;
                                    message.guild.musicTriviaData.triviaScore.set(
                                        m.author.username,
                                        message.guild.musicTriviaData.triviaScore.get(m.author.username) + 1
                                    );
                                    m.react('✔️');
                                    if (songNameFound && songArtistFound) return collector.stop();
                                } else if (m.content.toLowerCase() === triviaQueue[0].artist.toLowerCase()) {
                                    if (songArtistFound) return;
                                    
                                    songArtistFound = true;
                                    message.guild.musicTriviaData.triviaScore.set(
                                        m.author.username,
                                        message.guild.musicTriviaData.triviaScore.get(m.author.username) + 1
                                    );
                                    m.react('✔️');
                                    if (songNameFound && songArtistFound) return collector.stop();
                                } else if (m.content.toLowerCase() === triviaQueue[0].artist.toLowerCase() +
                                    ' ' + triviaQueue[0].title.toLowerCase() ||
                                    m.content.toLowerCase() === triviaQueue[0].title.toLowerCase() +
                                    ' ' + triviaQueue[0].artist.toLowerCase()) {
                                    if ((songArtistFound && !songNameFound) ||
                                        (songNameFound && !songArtistFound)) {
                                        message.guild.musicTriviaData.triviaScore.set(
                                            m.author.username,
                                            message.guild.musicTriviaData.triviaScore.get(m.author.username) + 1
                                        );
                                        m.react('✔️');
                                        return collector.stop();
                                    }
                                    message.guild.musicTriviaData.triviaScore.set(
                                        m.author.username,
                                        message.guild.musicTriviaData.triviaScore.get(m.author.username) + 2
                                    );
                                    m.react('✔️');
                                    return collector.stop();
                                }
                            })
                            .on("end", () => {
                                if (message.guild.musicTriviaData.wasTriviaEndCalled) {
                                    message.guild.musicTriviaData.wasTriviaEndCalled = false;
                                    return;
                                }

                                const sortedScoreMap = new Map(
                                    [...message.guild.musicTriviaData.triviaScore.entries()].sort((a, b) => b[1] - a[1])
                                );

                                const song = `${this.capitalizeWords(triviaQueue[0].artist)}: ${this.capitalizeWords(triviaQueue[0].title)}`;

                                embed
                                    .setTitle(`Answer: '${song}'`)
                                    .setDescription(this.getLeaderboard(Array.from(sortedScoreMap.entries())));

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
                            if (message.guild.musicTriviaData.wasTriviaEndCalled) { // end-trivia called
                                message.guild.musicData.isPlaying = false;
                                message.guild.musicTriviaData.isTriviaRunning = false;
                                message.guild.me.voice.channel.leave();
                                return;
                            }

                            const sortedScoreMap = new Map(
                                [...message.guild.musicTriviaData.triviaScore.entries()].sort((a, b) => b[1] - a[1])
                            );

                            embed
                                .setTitle(resultsEmbed.title)
                                .setDescription(this.getLeaderboard(Array.from(sortedScoreMap.entries())));

                            message.channel.send(embed);
                            message.guild.musicData.isPlaying = false;
                            message.guild.musicTriviaData.isTriviaRunning = false;
                            message.guild.musicTriviaData.triviaScore.clear();
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
    getLeaderboard(arr) {
        if (!arr) return;
        let leaderboard = '';

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