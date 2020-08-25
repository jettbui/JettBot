const { musicEmbeds } = require("../../json/embeds.json"),
    { musicResponses } = require("../../json/responses.json");
const { MessageEmbed } = require("discord.js");

module.exports = {
    name: "skip",
    description: "Skip the song currently playing",
    category: "music",
    aliases: [],
    args: false,
    cooldown: 5,
    guildOnly: true,
    disabled: true,
    async execute(message) {
        const voiceChannel = message.member.voice.channel;
        const currentSong = message.guild.musicData.nowPlaying;

        // validity checks
        if (!voiceChannel)
            return message.channel.send(musicResponses.noVoiceChannel);
        if (!message.guild.musicData.songDispatcher || typeof message.guild.musicData.songDispatcher == "undefined")
            return message.channel.send(musicResponses.noSong);
        if (voiceChannel.id !== message.guild.me.voice.channel.id)
            return message.channel.send(musicResponses.invalidVoiceChannel);
        if (message.guild.triviaData.isTriviaRunning)
            return message.channel.send(musicResponses.triviaRunning);

        const embed = new MessageEmbed()
            .setColor(musicEmbeds.skipEmbed.color)
            .setAuthor(musicEmbeds.skipEmbed.author.name)
            .setTitle(`<:musical_note:746147269488803931>   ${currentSong.title}`)
            .setThumbnail(currentSong.thumbnail)
            .setFooter(`Skipped by ${currentSong.userDisplayName}`, currentSong.userAvatar);

        console.log("Dispatcher Broke");
        console.log(message.guild.musicData.songDispatcher);
        message.guild.musicData.songDispatcher.end(); // FIXME NOT WORKING
        message.channel.send(embed);
    },
};