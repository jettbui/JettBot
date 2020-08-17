const Discord = require("discord.js");
const emotes = require("../json/emotes.json");

module.exports = {
    name: "emotes",
    description: "List all available emotes",
    category: "fun",
    aliases: ["elist"],
    args: false,
    guildOnly: false,
    execute(message, args) {

        const emotesEmbed = new Discord.MessageEmbed()
            .setColor("#7289da")
            .setTitle("All Emotes")
            .setAuthor("JettBot", "https://cdn.discordapp.com/avatars/734847208154857493/30a1820b464b373e85a9a2f66233d7e4.webp")
            .setFooter("Copyright JettBot, © 2020");
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
            if (parseInt(key.title)) {
                numEmotes.push(...key.data);
            } else if (key.title.match(/[a-f]/i)) {
                afEmotes.push(...key.data);
            } else if (key.title.match(/[g-m]/i)) {
                gmEmotes.push(...key.data);
            } else {
                nzEmotes.push(...key.data);
            }
        });

        emotesEmbed.addField("0-9", numEmotes.join(", "));
        emotesEmbed.addField("A-F", afEmotes.join(", "));
        emotesEmbed.addField("G-M", gmEmotes.join(", "));
        emotesEmbed.addField("N-Z", nzEmotes.join(", "));

        message.author.send(emotesEmbed);
    },
    alphabetize(arr) {
        return Object.values(
            arr.reduce((acc, word) => {
                let firstLetter = word[0].toLocaleUpperCase();
                if (!acc[firstLetter]) {
                    acc[firstLetter] = { title: firstLetter, data: [word] };
                } else {
                    acc[firstLetter].data.push(word);
                }
                return acc;
            }, {})
        );
    },
};