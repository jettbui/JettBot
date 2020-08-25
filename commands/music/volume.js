const { musicEmbeds } = require("../../json/embeds.json"),
    { musicResponses } = require("../../json/responses.json");
const { MessageEmbed } = require("discord.js");

module.exports = {
    name: "volume",
    description: "Sets the volume of the music",
    category: "music",
    aliases: [],
    args: true,
    usage: "<1-10>",
    cooldown: 5,
    guildOnly: true,
    disabled: true,
    async execute(message, args) {
        const voiceChannel = message.member.voice.channel;
        const volume = parseInt(args[0]);
        const user = message.member.user

        // validity checks
        if (isNaN(volume) || volume < 1 || volume > 10)
            return message.channel.send(musicResponses.invalidVolume);
        if (!voiceChannel)
            return message.channel.send(musicResponses.invalidVoiceChannel);
        if (voiceChannel.id !== message.guild.me.voice.channel.id)
            return message.channel.send(musicResponses.invalidVoiceChannel);
        if (typeof message.guild.musicData.songDispatcher == "undefined" ||
            message.guild.musicData.songDispatcher == null)
            return message.channel.send(musicResponses.noSong);
        
        const actualVolume = volume / 10;
        message.guild.musicData.volume = actualVolume;
        message.guild.musicData.songDispatcher.setVolume(actualVolume);

        const embed = new MessageEmbed()
            .setColor(musicEmbeds.volumeEmbed.color)
            .setAuthor(musicEmbeds.volumeEmbed.author.name)
            .setTitle(`${volume * 10}%`)
            .setDescription(this.volumeBar(volume))
            .setFooter(`Changed by ${user.username}`, user.avatarURL());

        message.channel.send(embed);
    },
    volumeBar(volume) {
        let bar = ':speaker:    ';
        for (let i = 0; i < 10; i++) {
            if (i >= volume) {
                bar = bar + ":red_square:"
            } else {
                bar = bar + ":green_square:";
            }
        }
        return bar;
    }
};