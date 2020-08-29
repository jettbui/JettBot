const { musicEmbeds } = require("../../json/embeds.json"),
    { musicResponses } = require("../../json/responses.json"),
    { MessageEmbed } = require("discord.js");

module.exports = {
    name: "forceskip",
    description: "Force skip the song currently playing",
    category: "music",
    aliases: [],
    permissions: ["ADMINISTRATOR"],
    args: false,
    cooldown: 5,
    guildOnly: true,
    async execute(message) {
        const voiceChannel = message.member.voice.channel;
        const currentSong = message.guild.musicData.nowPlaying;
        const user = message.member.user;

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
            .setFooter(`Skipped by ${user.username}`, user.avatarURL());

        message.guild.musicData.songDispatcher.end();
        message.channel.send(embed);
    },
};