const { Client, Collection } = require("discord.js");

module.exports = class extends Client {
    constructor(config) {
        super({
            disabledEvents: []
        });

        this.commands = new Collection();
        this.config = config;
        this.config.token = process.env.TOKEN;
        this.config.youtubeAPIKey = process.env.YOUTUBE_API;
    }
};
