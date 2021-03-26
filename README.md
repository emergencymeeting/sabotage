# Sabotage

A Discord bot for Among Us, written in Node.js.

It's primarily built to make it easier to share your current private room code, but it can do some other stuff too!

## Running The Bot

To start, run the following commands:

> **Note:** this assumes you have both [git](https://git-scm.com/) and [Node.js](https://nodejs.org/en/) installed - if not, see those links to download them.

```
## step 1: pull down this repository
git clone https://github.com/emergencymeeting/sabotage.git

## step 2: open up the repository we just pulled down
cd sabotage

## step 3: get all of our dependencies
npm install

## step 4: build the app
npm run build
```

You'll need to [set up a Discord App](https://discord.com/developers/applications). In the Developer Portal page for your app, go to the 'Bot' side tab, create a new bot, and note the bot token it generates.

After that, create a file called `.env` in the project directory and add your bot token in the following format:

```
BOT_TOKEN=<your discord bot app token>
DISCORD_CLIENT_ID=<your discord app client id>
DISCORD_CLIENT_SECRET=<your discord app client secret>
```

Then, run the app:

```
npm run start
```

## Local Development

To start, run the following commands:

```
## step 1: pull down this repository
git clone https://github.com/emergencymeeting/sabotage.git

## step 2: open up the repository we just pulled down
cd sabotage

## step 3: get all of our dependencies
npm install

## step 4: run the dev server
npm run dev
```
