const { musicEmbeds } = require("../../json/embeds.json"),
    { musicResponses } = require("../../json/responses.json"),
    { MessageEmbed } = require("discord.js");

module.exports = {
    name: "stop",
    description: "Stop playing music",
    category: "music",
    aliases: [],
    args: false,
    cooldown: 5,
    guildOnly: true,
    async execute(message) {
        const voiceChannel = message.member.voice.channel;
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
            .setColor(musicEmbeds.stopEmbed.color)
            .setAuthor(musicEmbeds.stopEmbed.author.name)
            .setFooter(`Stopped by ${user.username}`, user.avatarURL());

        message.guild.musicData.isPlaying = false;
        message.guild.musicData.nowPlaying = null;
        message.guild.musicData.queue.length = 0;
        message.guild.musicData.songDispatcher.end();
        message.guild.musicData.songDispatcher = null;
        message.channel.send(embed);
    },
};