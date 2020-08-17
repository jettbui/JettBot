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

Clone the repository files:

``` bash
git clone https://github.com/jettbui/JettBot.git
```

Go to working directory and install required packages:

``` bash
npm install
```

Open 'config.json' with a text editor and change the following line to your bot's Discord API token:

``` json
"token": = "<your token here>",
```

Run the bot with the following command in the working directory:

``` bash
node app.js
```

Invite the bot to your server using your generated [OAuth2](https://discord.com/developers/docs/topics/oauth2) URL.

Use the `!help` command to list the possible commands for the bot. (Note: You can change the command prefix in `config.json`)

## License

[MIT](https://github.com/jettbui/JettBot-py/blob/master/LICENSE.md)
