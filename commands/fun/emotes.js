const Discord = require("discord.js"),
    emotes = require("../../json/emotes.json"),
    { emotesEmbed } = require("../../json/embeds.json");

module.exports = {
    name: "emotes",
    description: "List all available TTV/BTTV/FFZ emotes",
    category: "fun",
    aliases: ["elist"],
    args: false,
    guildOnly: false,
    execute(message) {

        const embed = new Discord.MessageEmbed()
            .setColor(emotesEmbed.color)
            .setTitle(emotesEmbed.title)
            .setAuthor(emotesEmbed.author.name, emotesEmbed.author.icon_url)
            .setFooter(emotesEmbed.footer);
        let emoteArr = []

        for (let key in emotes) {
            emoteArr.push(key);
        }
        
        const alphabetizedArr = this.alphabetize(emoteArr);
        let numEmotes = [];
        let afEmotes = [];
        let gmEmotes = [];
        let nzEmotes = [];

        alphabetizedArr.forEach((key) => {
            if (parseInt(key.title))
                numEmotes.push(...key.data);
            else if (key.title.match(/[a-f]/i))
                afEmotes.push(...key.data);
            else if (key.title.match(/[g-m]/i))
                gmEmotes.push(...key.data);
            else
                nzEmotes.push(...key.data);
        });

        embed.addField("0-9", numEmotes.join(", "));
        embed.addField("A-F", afEmotes.join(", "));
        embed.addField("G-M", gmEmotes.join(", "));
        embed.addField("N-Z", nzEmotes.join(", "));

        message.channel.send(embed);
    },
    alphabetize(arr) {
        return Object.values(
            arr.reduce((acc, word) => {
                let firstLetter = word[0].toLocaleUpperCase();
                if (!acc[firstLetter])
                    acc[firstLetter] = { title: firstLetter, data: [word] };
                else
                    acc[firstLetter].data.push(word);
                return acc;
            }, {})
        );
    },
};