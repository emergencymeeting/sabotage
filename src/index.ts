require('dotenv').config()

import express from 'express'
import { Bot } from './lib/bot'
import functions from './functions'
import { VoiceChannel } from 'discord.js'

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

app.post('/comms', async (req, res) => {
  const { voiceChannelId, usersThatCanSpeak } = req.body

  // Look up the voice channel by ID
  const voiceChannel = (await bot.channels.fetch(
    voiceChannelId
  )) as VoiceChannel
  if (voiceChannel.type !== 'voice') return res.sendStatus(418)

  await Promise.all(
    voiceChannel.members.map(async (member) => {
      // TODO: Make this real smart g00d
      const discordMemberCanSpeak = usersThatCanSpeak.includes(
        member.user.username
      )

      if (discordMemberCanSpeak) {
        const permission = voiceChannel.permissionOverwrites.find((value) => {
          return value.type === 'member' && value.id === member.user.id
        })

        await permission?.delete()
      } else {
        await voiceChannel.createOverwrite(member.user, { SPEAK: false })
      }

      await member.voice.setChannel(voiceChannel)
    })
  )

  // Mute (but not server mute) everyone
  return res.sendStatus(200)
})

app.listen(port, () => {
  bot.log.success(`Server running at port ${port}`)
})
