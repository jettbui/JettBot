const { musicEmbeds } = require("../../json/embeds.json"),
    { musicResponses } = require("../../json/responses.json"),
    { MessageEmbed } = require("discord.js");

module.exports = {
    name: "skip",
    description: "Skip the song currently playing",
    category: "music",
    aliases: [],
    args: false,
    cooldown: 5,
    guildOnly: true,
    async execute(message) {
        const voiceChannel = message.member.voice.channel;
        const currentSong = message.guild.musicData.nowPlaying;
        const user = message.member.user;
        let voteCount = 0;
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

        // handle 1-2 users
        if (voiceChannel.members.size < 3) {
            const skipEmbed = new MessageEmbed()
                                .setColor(musicEmbeds.skipEmbed.color)
                                .setAuthor(musicEmbeds.skipEmbed.author.name)
                                .setTitle(`<:musical_note:746147269488803931>   ${currentSong.title}`)
                                .setThumbnail(currentSong.thumbnail)
                                .setFooter(`Skipped by ${user.username}`, user.avatarURL());

            message.channel.send(skipEmbed);
            message.guild.musicData.songDispatcher.end();
            return;
        }
        message.guild.musicData.skipVoteRunning = true;

        const embed = new MessageEmbed()
            .setColor(musicEmbeds.voteSkipEmbed.color)
            .setAuthor(`Vote to Skip (${voteCount}/${voteLimit} votes)`)
            .setTitle(`<:musical_note:746147269488803931>   ${currentSong.title}`)
            .setThumbnail(currentSong.thumbnail)
            .setFooter(`Called by ${user.username}`, user.avatarURL());

        message.channel.send(embed)
            .then((message) => {
                const filter = (reaction, user) => {
                    return reaction.emoji.name === "⏩" && user.id !== message.client.user.id
                };
                const collector = message.createReactionCollector(filter, { time: 60000 });
                message.guild.musicData.skipCollector = collector;
                collector
                    .on("collect", (reaction, user) => {
                        if (voteUsers.includes(user.id)) return;

                        voteCount += 1;
                        voteUsers.push(user.id)

                        if (voteCount >= voteLimit) {
                            collector.stop();
                        } else {
                            embed.setAuthor(`Vote to Skip (${voteCount}/${voteLimit} votes)`);
                            message.edit(embed);
                        }
                    })
                    .on("end", () => {
                        if (voteCount >= voteLimit) {
                            const skipEmbed = new MessageEmbed()
                                .setColor(musicEmbeds.skipEmbed.color)
                                .setAuthor(musicEmbeds.skipEmbed.author.name)
                                .setTitle(`<:musical_note:746147269488803931>   ${currentSong.title}`)
                                .setThumbnail(currentSong.thumbnail)
                                .setFooter(`Skipped by ${user.username}`, user.avatarURL());

                            message.edit(skipEmbed);
                            message.guild.musicData.songDispatcher.end();
                        } else {
                            embed.setAuthor(`Vote to Skip (${voteCount}/${voteLimit} votes) - Vote Ended`);
                            message.edit(embed);
                        }
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