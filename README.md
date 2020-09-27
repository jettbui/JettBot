# JettBot

> JettBot is a multi-purpose and easy-to-use Discord bot made using Javascript.

You can invite the bot to your server [here.](https://discord.com/api/oauth2/authorize?client_id=734847208154857493&permissions=8&scope=bot)

## Usage

### Required Packages

The bot may be run locally using [Node.js (12.0+)](https://nodejs.org/) or using a cloud platform such as [Heroku](https://www.heroku.com/).
Keep reading for instructions on how to run the bot locally.

The bot requires respective API token/credentials for the following services:

* [Discord](https://discord.com/developers)
* [Youtube Data API](https://developers.google.com/)

Clone the repository files:

``` bash
git clone https://github.com/jettbui/JettBot.git
```

Go to working directory and install required packages and dependencies:

``` bash
npm install
```

In the base directory, create a `.env` file and complete the following information using a text editor:

``` sh
TOKEN=<your discord bot token>
YOUTUBE_API=<your youtube API token>
```

Run the bot with the following command in the working directory:

``` bash
npm start
```

Invite the bot to your server using your generated [OAuth2](https://discord.com/developers/docs/topics/oauth2) URL.

Use the `!help` command to list the possible commands for the bot. (You can change the command prefix in `config.json`)

## License

[MIT](https://github.com/jettbui/JettBot-py/blob/master/LICENSE.md)
