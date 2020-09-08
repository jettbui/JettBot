const { MessageEmbed } = require("discord.js"),
    { globalEmbed, musicEmbeds: { songEmbed } } = require("../../json/embeds.json"),
    { musicResponses } = require("../../json/responses.json");

module.exports = {
    name: "song",
    description: "Show the song currently playing",
    category: "music",
    aliases: ["nowplaying", "songinfo"],
    args: false,
    guildOnly: true,
    async execute(message) {
        // validity checks
        if (!message.guild.musicData.isPlaying && !message.guild.musicData.nowPlaying)
            return message.channel.send(musicResponses.noSong);
        if (message.guild.triviaData.isTriviaRunning)
            return message.channel.send(musicResponses.triviaRunning);

        const song = message.guild.musicData.nowPlaying;
        const description = (song.duration == "Live Stream") ? "Live Stream" : this.playbackBar(message, song);
        const embed = new MessageEmbed()
            .setColor(globalEmbed.color)
            .setAuthor(songEmbed.author.name)
            .setThumbnail(song.thumbnail)
            .setTitle(`🎵   ${song.title}`)
            .setDescription(description)
            .setFooter(`Requested by ${song.userDisplayName}`, song.userAvatar);

        return message.channel.send(embed);
    },
    formatDuration(durationObj) {
        const duration = `${durationObj.hours ? (durationObj.hours + ":") : ""}${
            durationObj.minutes ? durationObj.minutes : "00"
            }:${
            (durationObj.seconds < 10)
                ? ("0" + durationObj.seconds)
                : (durationObj.seconds
                    ? durationObj.seconds
                    : "00")
            }`;
        return duration;
    },
    playbackBar(message, video) {
        const passedTimeInMS = message.guild.musicData.songDispatcher.streamTime;
        const passedTimeInMSObj = {
            seconds: Math.floor((passedTimeInMS / 1000) % 60),
            minutes: Math.floor((passedTimeInMS / (1000 * 60)) % 60),
            hours: Math.floor((passedTimeInMS / (1000 * 60 * 60)) % 24)
        };
        const passedTimeFormatted = this.formatDuration(passedTimeInMSObj);
        const totalDurationObj = video.rawDuration;
        const totalDurationFormatted = this.formatDuration(totalDurationObj);
        let totalDurationInMS = 0;

        Object.keys(totalDurationObj).forEach(function (key) {
            if (key == "hours") {
                totalDurationInMS = totalDurationInMS + totalDurationObj[key] * 3600000;
            } else if (key == "minutes") {
                totalDurationInMS = totalDurationInMS + totalDurationObj[key] * 60000;
            } else if (key == "seconds") {
                totalDurationInMS = totalDurationInMS + totalDurationObj[key] * 100;
            }
        });

        const playBackBarLocation = Math.round(
            (passedTimeInMS / totalDurationInMS) * 10
        );
        let playBack = "";

        for (let i = 1; i < 21; i++) {
            if (playBackBarLocation == 0) {
                playBack = "⚪️▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬";
                break;
            } else if (playBackBarLocation == 10) {
                playBack = "▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬⚪️";
                break;
            } else if (i == playBackBarLocation * 2) {
                playBack = playBack + "⚪️";
            } else {
                playBack = playBack + "▬";
            }
        }

        playBack = `${passedTimeFormatted}  ${playBack}  ${totalDurationFormatted}`;
        return playBack;
    },
};