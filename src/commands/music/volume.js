const { MessageEmbed } = require("discord.js"),
    { globalEmbed, musicEmbeds: { volumeEmbed } } = require("../../json/embeds.json"),
    { musicResponses } = require("../../json/responses.json");

module.exports = {
    name: "volume",
    description: "Set music volume",
    category: "music",
    aliases: ["vol"],
    args: false,
    usage: "[1-100]",
    guildOnly: true,
    async execute(message, args) {
        const voiceChannel = message.member.voice.channel;
        const currVolume = message.guild.musicData.volume;
        const user = message.member.user;
        const volume = parseInt(args[0]);
        const embed = new MessageEmbed()
            .setColor(globalEmbed.color)
            .setAuthor(volumeEmbed.author.name);

        if (!args[0]) {
            embed
                .setTitle(`${currVolume * 100}%`)
                .setDescription(this.volumeBar(currVolume));
            return message.channel.send(embed);
        } 

        // validity checks
        if (isNaN(volume) || volume < 1 || volume > 100)
            return message.channel.send(musicResponses.invalidVolume);
        if (typeof message.guild.musicData.songDispatcher == "undefined" ||
            message.guild.musicData.songDispatcher == null)
            return message.channel.send(musicResponses.noSong);
        if (!voiceChannel || !message.guild.me.voice.channel)
            return message.channel.send(musicResponses.invalidVoiceChannel);
        if (voiceChannel.id !== message.guild.me.voice.channel.id)
            return message.channel.send(musicResponses.invalidVoiceChannel);

        const actualVolume = volume / 100;
        message.guild.musicData.volume = actualVolume;
        message.guild.musicData.songDispatcher.setVolume(actualVolume);

        embed
            .setTitle(`${actualVolume * 100}%`)
            .setDescription(this.volumeBar(actualVolume))
            .setFooter(`Changed by ${user.username}`, user.avatarURL());

        return message.channel.send(embed);
    },
    volumeBar(volume) {
        const limit = Math.round(volume * 10);
        let bar = `${(limit > 7) ? "🔊" : (limit > 2) ? "🔉" : "🔈"}   `;
        
        for (let i = 0; i < 10; i++) {
            if (i >= limit) {
                bar = bar + "🟥";
            } else {
                bar = bar + "🟩";
            }
        }
        return bar;
    }
};