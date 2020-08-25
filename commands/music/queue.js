const { musicEmbeds } = require("../../json/embeds.json"),
    { musicResponses } = require("../../json/responses.json");
const { MessageEmbed } = require("discord.js");

module.exports = {
    name: "queue",
    description: "Shows the music queue",
    category: "music",
    aliases: [],
    args: false,
    cooldown: 5,
    guildOnly: true,
    async execute(message) {
        // validity checks
        if (message.guild.triviaData.isTriviaRunning) return message.channel.send(musicResponses.triviaRunning);
        if (message.guild.musicData.queue.length == 0) return message.channel.send(musicResponses.noSong);

        const queueList = [];
        queueList.push(message.guild.musicData.nowPlaying.title);
        message.guild.musicData.queue.slice(0, 10).forEach((s) => {
            queueList.push(s.title);
        });

        const embed = new MessageEmbed()
            .setColor(musicEmbeds.queueEmbed.color)
            .setTitle(`Music Queue - ${message.guild.musicData.queue.length + 1} songs`);

        for (let i = 0; i < queueList.length - 1; i++) {
            embed.addField(`${(i == 0) ? "Now Playing": i + 1}:`, queueList[i]);
        }

        message.channel.send(embed);
    },
};