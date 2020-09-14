const { MessageEmbed } = require("discord.js"),
    { globalEmbed } = require("../../json/embeds.json"),
    { nbaResponses } = require("../../json/responses.json"),
    fetch = require("node-fetch"),
    { tz } = require("moment-timezone"),
    nbaTeams = require("../../json/nbaTeams.json");

module.exports = {
    name: "nba",
    description: "Get NBA scores",
    category: "informational",
    aliases: [],
    args: false,
    usage: "[date]",
    disabled: true,
    execute(message, args) {
        // validity checks
        if(args[0] && !/^\d{4}-\d{2}-\d{2}$/.test(args[0])) return message.channel.send(nbaResponses.invalidDate);

        const todayDate = tz(Date.now(), "America/Los_Angeles");
        const date = (args[0]) ? tz(args[0], "America/Los_Angeles") : todayDate;
        const url = `http://data.nba.net/10s/prod/v1/${date.format("YYYYMMDD")}/scoreboard.json`;
        const embed = new MessageEmbed()
            .setColor(globalEmbed.color)
            .setFooter(globalEmbed.footer.text)
            .setThumbnail("https://cdn.freebiesupply.com/images/large/2x/nba-logo-transparent.png")
            .setTitle(`NBA Scores (${date.format("MMMM DD, YYYY")})`);

        fetch(url)
            .then((res) => res.json())
            .then((body) => {
                if (!body.games.length) embed.setDescription("No games today.");

                body.games.forEach((game) => {
                    const gameDate = tz(game.startTimeUTC, "America/Los_Angeles");
                    const hTeam = `${nbaTeams[game.hTeam.triCode]} (${game.hTeam.triCode})`;
                    const vTeam = `${nbaTeams[game.vTeam.triCode]} (${game.vTeam.triCode})`;
                    let head = null;
                    let desc = null;

                    if (game.isGameActivated) { // live game
                        head = `🔴 LIVE | ${hTeam} ${game.hTeam.score} - ${game.vTeam.score} ${vTeam}`;
                        desc = `Q${game.period.current} | ${game.clock} | `;
                        if (game.isHalftime) desc = desc + "Halftime";
                        else if (game.isEndOfPeriod) desc = desc + "End of Period";
                        else if (game.period.current > game.period.maxRegular) desc = desc + "Overtime";
                        else desc = desc + "Regulation";
                        desc = desc + `\n${game.nugget.text}`;
                        if (game.playoffs) desc = desc + 
                            `\nGame ${game.playoffs.gameNumInSeries} (${game.playoffs.seriesSummaryText})`;
                    } else if (todayDate.isBefore(gameDate)) { // future game
                        head = `${vTeam} @ ${hTeam}`;
                        desc = `Starts at ${gameDate.format("h:mm A [(PST)]")}`;
                        if (game.playoffs) desc = desc +
                            `\nGame ${game.playoffs.gameNumInSeries} (${game.playoffs.seriesSummaryText})`;
                    } else { // past game
                        const hTeamScore = (parseInt(game.hTeam.score) > parseInt(game.vTeam.score)) ? 
                            `__${game.hTeam.score}__` : game.hTeam.score;
                        const vTeamScore = (parseInt(game.vTeam.score) > parseInt(game.hTeam.score)) ?
                            `__${game.vTeam.score}__` : game.vTeam.score;
                        head = `${vTeam} ${vTeamScore} - ${hTeamScore} ${hTeam} | FINAL`;
                        desc = `${game.nugget.text}`;
                        if (game.playoffs) desc = desc +
                            `\nGame ${game.playoffs.gameNumInSeries} (${game.playoffs.seriesSummaryText})`;
                    }
                    
                    embed.addField(head, desc);
                });
                return message.channel.send(embed);
            });
    },
};
