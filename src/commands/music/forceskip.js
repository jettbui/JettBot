const { MessageEmbed } = require("discord.js"),
    { globalEmbed, musicEmbeds: { skipEmbed }} = require("../../json/embeds.json"),
    { musicResponses } = require("../../json/responses.json");

module.exports = {
    name: "forceskip",
    description: "Force skip the song currently playing",
    category: "music",
    aliases: [],
    permissions: ["ADMINISTRATOR"],
    args: false,
    guildOnly: true,
    async execute(message) {
        const voiceChannel = message.member.voice.channel;
        const currSong = message.guild.musicData.nowPlaying;
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
            .setColor(globalEmbed.color)
            .setAuthor(skipEmbed.author.name)
            .setTitle(`🎵   ${currSong.title}`)
            .setThumbnail(currSong.thumbnail)
            .setFooter(`Skipped by ${user.username}`, user.avatarURL());

        message.guild.musicData.songDispatcher.end();
        return message.channel.send(embed);
    },
};