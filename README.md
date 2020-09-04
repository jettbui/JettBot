# JettBot

> JettBot is a multi-purpose and easy-to-use Discord bot made using Javascript.

You can invite the bot to your server [here.](https://discord.com/api/oauth2/authorize?client_id=734847208154857493&permissions=8&scope=bot)

## Usage

### Required Packages

* [Node.js 12.0+](https://nodejs.org/)
* [discord.js](https://github.com/discordjs/discord.js/)
* [@discordjs/opus](https://www.npmjs.com/package/@discordjs/opus)
* [ffmpeg-static](https://www.npmjs.com/package/ffmpeg-static)
* [moment](https://momentjs.com/)
* [moment-timezone](https://momentjs.com/timezone/)
* [ytdl-core](https://www.npmjs.com/package/ytdl-core)

The bot may be run locally using [Node.js (12.0+)](https://nodejs.org/) or using a cloud platform such as [Heroku](https://www.heroku.com/).
Keep reading for instructions on how to run the bot locally.

#### Note: The bot utilizes the Youtube API and therefore requires a respective API token/credentials.

Clone the repository files:

``` bash
git clone https://github.com/jettbui/JettBot.git
```

Go to working directory and install required packages:

``` bash
npm install
```

In the base directory, create a `config.json` file and complete the following information using a text editor:

``` json
{
    "defaultActivity": "!help",
    "defaultCooldown": 2,
    "logMessages": false,
    "ownerId": "<your Discord ID>",
    "prefix": "!",
    "token": "<your bot API token>",
    "youtubeAPIkey": "<your Youtube API token>"
}
```

Run the bot with the following command in the working directory:

``` bash
node app.js
```

Invite the bot to your server using your generated [OAuth2](https://discord.com/developers/docs/topics/oauth2) URL.

Use the `!help` command to list the possible commands for the bot. (You can change the command prefix in `config.json`)

## License

[MIT](https://github.com/jettbui/JettBot-py/blob/master/LICENSE.md)
