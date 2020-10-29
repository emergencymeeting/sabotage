# Sabotage

A Discord bot for Among Us, written in Node.js.

## Running The Bot

To start, run the following commands: 

> **Note:** this assumes you have both [git](https://git-scm.com/) and [Node.js](https://nodejs.org/en/) installed - if not, see those links to download them.

```
## step 1: pull down this repository
git clone https://github.com/JasonEtco/sabotage.git

## step 2: open up the repository we just pulled down
cd sabotage

## step 3: get all of our dependencies
npm install

## step 4: build the app
npm run build
```

You'll need to set up a Discord App. From that app, we're going to create a file called `.env` in the directory, you'll need to add your bot token in the following format:

```
BOT_TOKEN=<your discord bot app token>
```

Then, run the app:

```
npm run start
```

## Local Development

To start, run the following commands:

```
## step 1: pull down this repository
git clone https://github.com/JasonEtco/sabotage.git

## step 2: open up the repository we just pulled down
cd sabotage

## step 3: get all of our dependencies
npm install

## step 4: run the dev server
npm run dev
```
