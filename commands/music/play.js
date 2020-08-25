const { toUpperCase } = require("ffmpeg-static");

const { MessageEmbed } = require("discord.js"),
    Youtube = require("simple-youtube-api"),
    ytdl = require("ytdl-core"),
    { youtubeAPIkey } = require("../../config.json"),
    youtube = new Youtube(youtubeAPIkey),
    { musicEmbeds } = require("../../json/embeds.json"),
    { musicResponses } = require("../../json/responses.json");

module.exports = {
    name: "play",
    description: "Play a song/playlist from a Youtube link",
    category: "music",
    aliases: [],
    args: true,
    usage: "<link>",
    cooldown: 5,
    guildOnly: true,
    disabled: false,
    async execute(message, args) {
        const voiceChannel = message.member.voice.channel;
        let query = args.join(" ");

        // validity checks
        if (!voiceChannel) return message.channel.send(musicResponses.noVoiceChannel);
        if (message.guild.triviaData.isTriviaRunning) return message.channel.send(musicResponses.triviaRunning);

        if (query.match(/^(?!.*\?.*\bv=)https:\/\/www\.youtube\.com\/.*\?.*\blist=.*$/)) { // playlist
            try {
                const playlist = await youtube.getPlaylist(query);
                const videos = await playlist.getVideos();
                const user = message.member.user;

                for (let i = videos.length - 1; i > 0; i--) { // shuffle
                    const j = Math.floor(Math.random() * (i + 1));
                    [videos[i], videos[j]] = [videos[j], videos[i]];
                }

                for (let i = 0; i < videos.length; i++) {
                    const video = await videos[i].fetch();
                    const songObj = this.constructSongObj(video, voiceChannel, message.member.user);

                    message.guild.musicData.queue.push(songObj);
                }

                if (!message.guild.musicData.isPlaying) {
                    message.guild.musicData.isPlaying = true;
                    return this.playSong(message, message.guild.musicData.queue);
                } else if (message.guild.musicData.isPlaying) {
                    const embed = new MessageEmbed()
                        .setColor(musicEmbeds.queuedEmbed.color)
                        .setAuthor(musicEmbeds.queuedEmbed.author.name)
                        .setTitle(`<:musical_note:746147269488803931>   Playlist - ${playlist.title}`)
                        .setFooter(`Requested by ${user.username}`, user.avatarURL());;
                    return message.channel.send(embed);
                }
            } catch (error) {
                console.error(error);
                return message.channel.send(musicResponses.invalidPlaylist)
            }
        } else if (query.match(/^(http(s)?:\/\/)?((w){3}.)?youtu(be|.be)?(\.com)?\/.+/)) { // song url
            try {
                query = query
                    .replace(/(>|<)/gi, '')
                    .split(/(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/)/);
                const id = query[2].split(/[^0-9a-z_\-]/i)[0];
                const video = await youtube.getVideoByID(id);
                const songObj = this.constructSongObj(video, voiceChannel, message.member.user);

                message.guild.musicData.queue.push(songObj);

                if (!message.guild.musicData.isPlaying || typeof message.guild.musicData.isPlaying == "undefined") {
                    message.guild.musicData.isPlaying = true;
                    return this.playSong(message, message.guild.musicData.queue);
                } else if (message.guild.musicData.isPlaying) {
                    const embed = new MessageEmbed()
                        .setColor(musicEmbeds.queuedEmbed.color)
                        .setAuthor(musicEmbeds.queuedEmbed.author.name)
                        .setTitle(`<:musical_note:746147269488803931>   ${songObj.title}`)
                        .setThumbnail(song.thumbnail)
                        .addField("Duration", songObj.duration)
                        .setFooter(`Requested by ${songObj.userDisplayName}`, songObj.userAvatar);
                    return message.channel.send(embed)
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
            const songObj = this.constructSongObj(video, voiceChannel, message.member.user);

            message.guild.musicData.queue.push(songObj);

            if (!message.guild.musicData.isPlaying) {
                message.guild.musicData.isPlaying = true;
                return this.playSong(message, message.guild.musicData.queue);
            } else if (message.guild.musicData.isPlaying) {
                const embed = new MessageEmbed()
                    .setColor(musicEmbeds.queuedEmbed.color)
                    .setAuthor(musicEmbeds.queuedEmbed.author.name)
                    .setTitle(`<:musical_note:746147269488803931>   ${songObj.title}`)
                    .setThumbnail(songObj.thumbnail)
                    .addField("Duration", songObj.duration)
                    .setFooter(`Requested by ${songObj.userDisplayName}`, songObj.userAvatar);
                return message.channel.send(embed)
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
        const duration = `${durationObj.hours ? durationObj.hours + ':' : ''}${
            durationObj.minutes ? durationObj.minutes : '00'
            }:${
            durationObj.seconds < 10
                ? '0' + durationObj.seconds
                : durationObj.seconds
                    ? durationObj.seconds
                    : '00'
            }`;
        return duration;
    },
    playSong(message, queue) {
        let voiceChannel;
        queue[0].voiceChannel
            .join()
            .then((connection) => {
                const dispatcher = connection
                    .play(ytdl(queue[0].url), { quality: "highestaudio", highWaterMark: 1 << 25 })
                    .on("start", () => {
                        message.guild.musicData.songDispatcher = dispatcher;
                        console.log("Dispatcher Fresh");
                        console.log(dispatcher);
                        dispatcher.setVolume(message.guild.musicData.volume);

                        const embed = new MessageEmbed()
                            .setColor(musicEmbeds.songEmbed.color)
                            .setAuthor(musicEmbeds.songEmbed.author.name)
                            .setTitle(`<:musical_note:746147269488803931>   ${queue[0].title}`)
                            .setThumbnail(queue[0].thumbnail)
                            .addField("Duration", queue[0].duration, true)
                            .setFooter(`Requested by ${queue[0].userDisplayName}`, queue[0].userAvatar);

                        if (queue[1]) embed.addField("Up next", queue[1].title, true);

                        message.channel.send(embed);
                        message.guild.musicData.nowPlaying = queue[0];
                        queue.shift();
                        return;
                    })
                    .on("finish", () => {
                        console.log("Song Finished/Skip Called");
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
                        message.channel.send(musicResponses.error);
                        message.guild.musicData.queue.length = 0;
                        message.guild.musicData.isPlaying = false;
                        message.guild.musicData.nowPlaying = null;
                        message.guild.musicData.songDispatcher = null;
                        voiceChannel.leave();
                        return;
                    });
            })
            .catch((error) => {
                console.error(error);
                message.channel.send(musicResponses.error);
                message.guild.musicData.queue.length = 0;
                message.guild.musicData.isPlaying = false;
                message.guild.musicData.nowPlaying = null;
                message.guild.musicData.songDispatcher = null;
                return voiceChannel.leave();
            })
    }
};