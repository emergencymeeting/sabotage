require('dotenv').config()

import express from 'express'
import { Bot } from './lib/bot'
import functions from './functions'
import createCommsRouter from './lib/comms'

const port = process.env.WEBSITES_PORT || process.env.PORT || 8080

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

const friends = ['Jason', 'Em', 'Tierney', 'Sam', 'Clippy', 'Joel']

function susGen() {
  const num = Math.floor(Math.random() * friends.length)
  return friends[num]
}

const app = express()

app.use(express.json())

app.get('/', (req, res) => {
  res.send(`<h1>${susGen()} is sus.</h1>`)
})

app.use('/comms', createCommsRouter(bot))

app.listen(port, () => {
  bot.log.success(`Server running at port ${port}`)
})
