const { MessageEmbed } = require("discord.js"),
    { globalEmbed, musicEmbeds: { stopEmbed } } = require("../../json/embeds.json"),
    { musicResponses } = require("../../json/responses.json");

module.exports = {
    name: "stop",
    description: "Stop playing music",
    category: "music",
    aliases: [],
    permissions: ["ADMINISTRATOR"],
    args: false,
    guildOnly: true,
    async execute(message) {
        const voiceChannel = message.member.voice.channel;
        const user = message.member.user;
        const embed = new MessageEmbed()
            .setColor(globalEmbed.color)
            .setAuthor(stopEmbed.author.name)
            .setFooter(`Stopped by ${user.username}`, user.avatarURL());

        // validity checks
        if (!voiceChannel)
            return message.channel.send(musicResponses.noVoiceChannel);
        if (!message.guild.musicData.songDispatcher || typeof message.guild.musicData.songDispatcher == "undefined")
            return message.channel.send(musicResponses.noSong);
        if (voiceChannel.id !== message.guild.me.voice.channel.id)
            return message.channel.send(musicResponses.invalidVoiceChannel);
        if (message.guild.triviaData.isTriviaRunning)
            return message.channel.send(musicResponses.triviaRunning);

        message.guild.musicData.isPlaying = false;
        message.guild.musicData.nowPlaying = null;
        message.guild.musicData.queue.length = 0;
        message.guild.musicData.songDispatcher.end();
        message.guild.musicData.songDispatcher = null;
        return message.channel.send(embed);
    },
};