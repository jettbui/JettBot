const { MessageEmbed } = require("discord.js"),
    { globalEmbed, musicEmbeds: { skipEmbed } } = require("../../json/embeds.json"),
    { musicResponses } = require("../../json/responses.json");

module.exports = {
    name: "skip",
    description: "Skip the song currently playing",
    category: "music",
    aliases: [],
    args: false,
    guildOnly: true,
    async execute(message) {
        const voiceChannel = message.member.voice.channel;
        const currentSong = message.guild.musicData.nowPlaying;
        const user = message.member.user;
        const interval = 10000; // interval to update timer (ms)
        let timer = 30000; // time to run poll (ms)
        const voteLimit = Math.floor((voiceChannel.members.size - 1) / 2) + 1;
        const voteUsers = [];

        // validity checks
        if (!voiceChannel)
            return message.channel.send(musicResponses.noVoiceChannel);
        if (!message.guild.musicData.songDispatcher || typeof message.guild.musicData.songDispatcher == "undefined")
            return message.channel.send(musicResponses.noSong);
        if (voiceChannel.id !== message.guild.me.voice.channel.id)
            return message.channel.send(musicResponses.invalidVoiceChannel);
        if (message.guild.triviaData.isTriviaRunning)
            return message.channel.send(musicResponses.triviaRunning);
        if (message.guild.musicData.skipVoteRunning)
            return message.channel.send(musicResponses.voteRunning);

        const embed = new MessageEmbed()
            .setColor(globalEmbed.color)
            .setTitle(`🎵   ${currentSong.title}`)
            .setThumbnail(currentSong.thumbnail);

        // handle 1-2 users
        if (voiceChannel.members.size < 3) {
            embed
                .setAuthor(skipEmbed.author.name)
                .setFooter(`Skipped by ${user.username}`, user.avatarURL());

            message.guild.musicData.songDispatcher.end();
            return message.channel.send(embed);
        }

        message.guild.musicData.skipVoteRunning = true;

        embed
            .setAuthor(`Vote to Skip (${voteUsers.length}/${voteLimit} votes)`)
            .setFooter(`Called by ${user.username} (${timer / 1000} seconds left)`, user.avatarURL());

        message.channel.send(embed)
            .then(message => {
                const filter = (reaction, user) => {
                    return reaction.emoji.name === "⏩" && user.id !== message.client.user.id
                };
                const stopwatch = setInterval(() => {
                    timer = timer - interval;
                    embed.setFooter(`Called by ${user.username} (${timer / 1000} seconds left)`, user.avatarURL());
                    message.edit(embed);
                }, interval);
                const collector = message.createReactionCollector(filter, { time: 30000 });
                message.guild.musicData.skipCollector = collector
                    .on("collect", (reaction, user) => {
                        if (voteUsers.includes(user)) return;

                        voteUsers.push(user)

                        if (voteUsers.length >= voteLimit) {
                            collector.stop();
                        } else {
                            embed.setAuthor(`Vote to Skip (${voteUsers.length}/${voteLimit} votes)`);
                            message.edit(embed);
                        }
                    })
                    .on("end", () => {
                        clearInterval(stopwatch);

                        if (voteUsers.length >= voteLimit) {
                            const voteUsersString = voteUsers.map(u => u.username).join(", ");

                            embed
                                .setAuthor(skipEmbed.author.name)
                                .setFooter(`Vote Skipped by ${voteUsersString}`, user.avatarURL());

                            message.guild.musicData.songDispatcher.end();
                        } else {
                            embed
                                .setAuthor(`Vote to Skip (${voteUsers.length}/${voteLimit} votes)`)
                                .setFooter(`Called by ${user.username} (Vote Ended)`, user.avatarURL());
                        }
                        message.edit(embed);
                        message.guild.musicData.skipVoteRunning = false;
                        message.guild.musicData.skipCollector = null;
                    });

                message.react("⏩");
            })
            .catch((error) => {
                console.log(error);
                message.guild.musicData.skipVoteRunning = false;
                message.guild.musicData.skipCollector = null;
            })
    }
};