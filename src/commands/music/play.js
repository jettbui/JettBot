const { MessageEmbed } = require("discord.js"),
    Youtube = require("simple-youtube-api"),
    ytdl = require("ytdl-core-discord"),
    { globalEmbed, musicEmbeds: { queueEmbed, songEmbed } } = require("../../json/embeds.json"),
    { musicResponses } = require("../../json/responses.json");

module.exports = {
    name: "play",
    description: "Play music from Youtube",
    category: "music",
    aliases: ["p"],
    args: true,
    usage: "<link>",
    guildOnly: true,
    async execute(message, args) {
        const youtube = new Youtube(message.client.config.youtubeAPIKey);
        const voiceChannel = message.member.voice.channel;
        const user = message.member.user;
        const embed = new MessageEmbed()
            .setColor(globalEmbed.color)
            .setAuthor(queueEmbed.author.name)
            .setFooter(`Requested by ${user.username}`, user.avatarURL());
        let query = args.join(" ");

        // validity checks
        if (!voiceChannel) return message.channel.send(musicResponses.noVoiceChannel);
        if (message.guild.triviaData.isTriviaRunning) return message.channel.send(musicResponses.triviaRunning);

        if (query.match(/^(?!.*\?.*\bv=)https:\/\/www\.youtube\.com\/.*\?.*\blist=.*$/)) { // playlist
            try {
                const playlist = await youtube.getPlaylist(query);
                const videos = await playlist.getVideos();

                for (let i = videos.length - 1; i > 0; i--) { // shuffle
                    const j = Math.floor(Math.random() * (i + 1));
                    [videos[i], videos[j]] = [videos[j], videos[i]];
                }

                for (let i = 0; i < videos.length; i++) {
                    const video = await videos[i].fetch();
                    const songObj = this.constructSongObj(video, voiceChannel, user);

                    message.guild.musicData.queue.push(songObj);
                }

                if (!message.guild.musicData.isPlaying) {
                    message.guild.musicData.isPlaying = true;
                    return this.playSong(message, message.guild.musicData.queue);
                } else if (message.guild.musicData.isPlaying) {
                    embed.setTitle(`🎶   Playlist - ${playlist.title}`);
                    return message.channel.send(embed);
                }
            } catch (error) {
                console.error(error);
                return message.channel.send(musicResponses.invalidPlaylist);
            }
        } else if (query.match(/^(http(s)?:\/\/)?((w){3}.)?youtu(be|.be)?(\.com)?\/.+/)) { // song url
            try {
                query = query
                    .replace(/(>|<)/gi, "")
                    .split(/(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/)/);
                const id = query[2].split(/[^0-9a-z_\-]/i)[0]; // eslint-disable-line no-useless-escape
                const video = await youtube.getVideoByID(id);
                const songObj = this.constructSongObj(video, voiceChannel, user);

                message.guild.musicData.queue.push(songObj);

                if (!message.guild.musicData.isPlaying || typeof message.guild.musicData.isPlaying == "undefined") {
                    message.guild.musicData.isPlaying = true;
                    return this.playSong(message, message.guild.musicData.queue);
                } else if (message.guild.musicData.isPlaying) {
                    embed
                        .setTitle(`🎵   ${songObj.title}`)
                        .setThumbnail(songObj.thumbnail)
                        .addField("Duration", songObj.duration);
                    return message.channel.send(embed);
                }
            } catch (error) {
                console.error(error);
                return message.channel.send(musicResponses.invalidSong);
            }
        }

        // song name
        try {
            const videos = await youtube.searchVideos(query, 1);
            if (!videos || videos.length < 1) return message.channel.send(musicResponses.invalidSong);

            const video = await youtube.getVideoByID(videos[0].id);
            const songObj = this.constructSongObj(video, voiceChannel, user);

            message.guild.musicData.queue.push(songObj);

            if (!message.guild.musicData.isPlaying) {
                message.guild.musicData.isPlaying = true;
                return this.playSong(message, message.guild.musicData.queue);
            } else if (message.guild.musicData.isPlaying) {
                embed
                    .setTitle(`🎵   ${songObj.title}`)
                    .setThumbnail(songObj.thumbnail)
                    .addField("Duration", songObj.duration);
                return message.channel.send(embed);
            }
        } catch (error) {
            console.error(error);
            return message.channel.send(musicResponses.invalidSong);
        }
    },
    constructSongObj(video, voiceChannel, user) {
        let duration = this.formatDuration(video.duration);
        if (duration == "00:00") duration = "Live Stream";

        return { // song object
            url: `https://www.youtube.com/watch?v=${video.raw.id}`,
            title: video.title,
            rawDuration: video.duration,
            duration,
            thumbnail: video.thumbnails.high.url,
            voiceChannel,
            userDisplayName: user.username,
            userAvatar: user.avatarURL()
        };
    },
    formatDuration(durationObj) {
        const duration = `${durationObj.hours ? durationObj.hours + ":" : ""}${
            durationObj.minutes ? durationObj.minutes : "00"
        }:${
            durationObj.seconds < 10
                ? "0" + durationObj.seconds
                : durationObj.seconds
                    ? durationObj.seconds
                    : "00"
        }`;
        return duration;
    },
    playSong(message, queue) {
        const embed = new MessageEmbed()
            .setColor(globalEmbed.color)
            .setAuthor(songEmbed.author.name)
            .setTitle(`🎵   ${queue[0].title}`)
            .setThumbnail(queue[0].thumbnail)
            .addField("Duration", queue[0].duration, true)
            .setFooter(`Requested by ${queue[0].userDisplayName}`, queue[0].userAvatar);

        queue[0].voiceChannel
            .join()
            .then(async connection => {
                const dispatcher = connection
                    .play(await ytdl(queue[0].url), { type: "opus" })
                    .on("start", () => {
                        message.guild.musicData.songDispatcher = dispatcher;
                        dispatcher.setVolume(message.guild.musicData.volume);

                        if (queue[1]) embed.addField("Up next", queue[1].title, true);

                        message.guild.musicData.nowPlaying = queue[0];
                        queue.shift();
                        return message.channel.send(embed);
                    })
                    .on("finish", () => {
                        if (message.guild.musicData.skipCollector) // end skip vote
                            message.guild.musicData.skipCollector.stop();

                        if (queue.length >= 1) {
                            return this.playSong(message, queue);
                        } else {
                            message.guild.musicData.isPlaying = false;
                            message.guild.musicData.nowPlaying = null;
                            message.guild.musicData.songDispatcher = null;
                            if (message.guild.me.voice.channel) message.guild.me.voice.channel.leave();
                            return;
                        }
                    })
                    .on("error", (error) => {
                        console.error(error);
                        message.guild.musicData.queue.length = 0;
                        message.guild.musicData.isPlaying = false;
                        message.guild.musicData.nowPlaying = null;
                        message.guild.musicData.songDispatcher = null;
                        message.guild.me.voice.channel.leave();
                        return message.channel.send(musicResponses.error);
                    });
            })
            .catch((error) => {
                console.error(error);
                message.guild.musicData.queue.length = 0;
                message.guild.musicData.isPlaying = false;
                message.guild.musicData.nowPlaying = null;
                message.guild.musicData.songDispatcher = null;
                message.guild.me.voice.channel.leave();
                return message.channel.send(musicResponses.error);
            });
    }
};