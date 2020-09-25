const { MessageEmbed } = require("discord.js"),
    { globalEmbed } = require("../../json/embeds.json"),
    { musicResponses } = require("../../json/responses.json");

module.exports = {
    name: "queue",
    description: "Show the music queue",
    category: "music",
    aliases: ["q"],
    args: false,
    guildOnly: true,
    async execute(message) {
        const currSong = message.guild.musicData.nowPlaying;
        const queue = message.guild.musicData.queue;
        const embed = new MessageEmbed()
            .setColor(globalEmbed.color)
            .setTitle(`Music Queue (${queue.length + 1} ${(queue.length === 1) ? "song" : "songs"})`);

        // validity checks
        if (message.guild.triviaData.isTriviaRunning) return message.channel.send(musicResponses.triviaRunning);
        if (message.guild.musicData.queue.length == 0 && !currSong) return message.channel.send(musicResponses.noSong);

        const queueList = [];
        queueList.push(currSong.title);
        queue.slice(0, 10).forEach(s => {
            queueList.push(s.title);
        });

        for (let i = 0; i < queueList.length; i++) {
            embed.addField(`${(i == 0) ? "Now Playing:" : i + 1}`, queueList[i]);
        }

        return message.channel.send(embed);
    },
};