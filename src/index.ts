require('dotenv').config()

import { Bot } from './lib/bot'
import functions from './functions'

// Our Bot client!
const bot = new Bot()

// Load our bot's functions
bot.load(functions).then(async () => {
  // Authenticate our bot
  await bot.login(process.env.BOT_TOKEN)

  // Log a snarky comment
  const rating = Math.floor(Math.random() * 10)
  bot.log.success(`I'd rate the startup a ${rating}/10`)
})
