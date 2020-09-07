const { MessageEmbed } = require("discord.js"),
    emotes = require("../../json/emotes.json"),
    { globalEmbed, emotesEmbed } = require("../../json/embeds.json");

module.exports = {
    name: "emotes",
    description: "List all available TTV/BTTV/FFZ emotes",
    category: "fun",
    aliases: ["elist"],
    args: false,
    execute(message) {
        const emoteArr = [];
        const embed = new MessageEmbed()
            .setColor(globalEmbed.color)
            .setAuthor(globalEmbed.author.name, globalEmbed.author.icon_url)
            .setFooter(globalEmbed.footer.text)
            .setTitle(emotesEmbed.title);

        for (const key in emotes) {
            emoteArr.push(key);
        }
        
        const alphabetizedArr = this.alphabetize(emoteArr);
        const numEmotes = [],
            azEmotes1 = [],
            azEmotes2 = [],
            azEmotes3 = [];

        alphabetizedArr.forEach((key) => {
            if (parseInt(key.title))
                numEmotes.push(...key.data);
            else if (key.title.match(/[a-f]/i))
                azEmotes1.push(...key.data);
            else if (key.title.match(/[g-o]/i))
                azEmotes2.push(...key.data);
            else
                azEmotes3.push(...key.data);
        });

        embed
            .addField("0-9", numEmotes.join(", "))
            .addField("A-F", azEmotes1.join(", "))
            .addField("G-O", azEmotes2.join(", "))
            .addField("P-Z", azEmotes3.join(", "));

        return message.author.send(embed);
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