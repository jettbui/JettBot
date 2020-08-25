const { musicEmbeds } = require("../../json/embeds.json"),
    { musicResponses } = require("../../json/responses.json");
const { MessageEmbed } = require("discord.js");

module.exports = {
    name: "song",
    description: "Shows the current song playing",
    category: "music",
    aliases: ["nowplaying", "currentsong", "songinfo"],
    args: false,
    cooldown: 5,
    guildOnly: true,
    async execute(message) {
        // validity checks
        if (!message.guild.musicData.isPlaying && !message.guild.musicData.nowPlaying || message.guild.triviaData.isTriviaRunning)
            return message.channel.send(musicResponses.triviaRunning);

        const song = message.guild.musicData.nowPlaying;
        let description;
        if (song.duration == "Live Stream") {
            description = "Live Stream";
        } else {
            description = this.playbackBar(message, song);
        }

        const embed = new MessageEmbed()
            .setColor(musicEmbeds.songDetailedEmbed.color)
            .setAuthor(musicEmbeds.songDetailedEmbed.author.name)
            .setThumbnail(song.thumbnail)
            .setTitle(`:musical_note:   ${song.title}`)
            .setDescription(description)
            .setFooter(`Requested by ${song.userDisplayName}`, song.userAvatar);

        return message.channel.send(embed);
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
            if (key == 'hours') {
                totalDurationInMS = totalDurationInMS + totalDurationObj[key] * 3600000;
            } else if (key == 'minutes') {
                totalDurationInMS = totalDurationInMS + totalDurationObj[key] * 60000;
            } else if (key == 'seconds') {
                totalDurationInMS = totalDurationInMS + totalDurationObj[key] * 100;
            }
        });
        const playBackBarLocation = Math.round(
            (passedTimeInMS / totalDurationInMS) * 10
        );
        let playBack = '';
        for (let i = 1; i < 21; i++) {
            if (playBackBarLocation == 0) {
                playBack = ':white_circle:▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬';
                break;
            } else if (playBackBarLocation == 10) {
                playBack = '▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬:white_circle:';
                break;
            } else if (i == playBackBarLocation * 2) {
                playBack = playBack + ':white_circle:';
            } else {
                playBack = playBack + '▬';
            }
        }
        playBack = `${passedTimeFormatted}  ${playBack}  ${totalDurationFormatted}`;
        return playBack;
    },
    // prettier-ignore
    formatDuration(durationObj) {
        const duration = `${durationObj.hours ? (durationObj.hours + ':') : ''}${
            durationObj.minutes ? durationObj.minutes : '00'
            }:${
            (durationObj.seconds < 10)
                ? ('0' + durationObj.seconds)
                : (durationObj.seconds
                    ? durationObj.seconds
                    : '00')
            }`;
        return duration;
    }
};