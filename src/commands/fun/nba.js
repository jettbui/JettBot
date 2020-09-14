const { MessageEmbed } = require("discord.js"),
    { globalEmbed } = require("../../json/embeds.json"),
    fetch = require("node-fetch"),
    { tz } = require("moment-timezone");

module.exports = {
    name: "nba",
    description: "Get NBA stats",
    category: "fun",
    aliases: [],
    args: false,
    usage: "[args]",
    guildOnly: true,
    execute(message) {
        const todayDate = tz(Date.now(), "America/Los_Angeles");
        let desc = "No games today.";
        const embed = new MessageEmbed()
            .setColor(globalEmbed.color)
            .setTitle(todayDate.format("MMMM DD, YYYY"))
            .setFooter(globalEmbed.footer.text);
        
        desc = this.getGames(0)
            .then(() => {
                embed.setDescription(desc);
                return message.channel.send(embed);
            });
    },
    async getGames() {
        let output = "";
        await fetch("http://data.nba.net/10s/prod/v1/20200909/scoreboard.json")
            .then((res) => res.json())
            .then((body) => {
                body.games.forEach((game) => {
                    output = output + `${tz(game.startTimeUTC, "America/Los_Angeles").format("h:mm A [(PST)]")} - ${tz(game.endTimeUTC, "America/Los_Angeles").format("h:mm A [(PST)]")}\n${game.hTeam.triCode} ${game.hTeam.score} - ${game.vTeam.score} ${game.vTeam.triCode}\n`;
                });
                console.log("OUTPUT DONE");
                return output;
            });
        console.log("FUNCTION DONE");
    },
};
