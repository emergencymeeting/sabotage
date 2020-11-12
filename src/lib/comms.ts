import express from 'express'
import { VoiceChannel } from 'discord.js'
import fetch from 'node-fetch'
import { Bot } from './bot'
import passport from './discord-auth'
import { ROLE_PREFIX } from '../functions/claim'

export default (bot: Bot) => {
  const router = express.Router()

  router.use(passport.initialize())

  router.get('/web-auth', (req, res, next) => {
    passport.authenticate('discord', { session: false }, (err, user) => {
      if (err) {
        return res.send('Oopsie whoopsie')
      }
      res.setHeader('Content-Type', 'text/html')
      return res.send(
        `Please copy this token into Comms: <input readonly value="${user.accessToken}" />`
      )
    })(req, res, next)
  })

  // Given an auth header, check if the user (whose token is in the header)
  // is in the given voice channel.
  router.use(async (req, res, next) => {
    const { voiceChannelId } = req.body

    // Check that we got the auth token header
    const token = req.get('Authorization')
    if (!token) return res.sendStatus(401)

    try {
      // Create a new client using the user's token
      const response = await fetch('https://discord.com/api/users/@me', {
        headers: {
          Authorization: `Bearer ${token.substr('token '.length)}`,
        },
      })

      if (response.status !== 200) return res.sendStatus(403)

      const user = await response.json()

      // Look up the voice channel by ID
      const voiceChannel = (await bot.channels.fetch(
        voiceChannelId
      )) as VoiceChannel
      if (voiceChannel.type !== 'voice') return res.sendStatus(418)

      // Check if the user is in the voice channel
      const userIsInChannel = voiceChannel.members.find((member) => {
        return member.user.id === user!.id
      })

      if (userIsInChannel) {
        return next()
      } else {
        return res.sendStatus(403)
      }
    } catch (err) {
      bot.log.error(err)
      return res.sendStatus(403)
    }
  })

  // Mutes everyone except `usersThatCanSpeak`
  router.post('/mute', async (req, res) => {
    const { voiceChannelId, usersThatCanSpeak } = req.body

    // Look up the voice channel by ID
    const voiceChannel = (await bot.channels.fetch(
      voiceChannelId
    )) as VoiceChannel
    if (voiceChannel.type !== 'voice') return res.sendStatus(418)

    await Promise.all(
      voiceChannel.members.map(async (member) => {
        // Determine if this voice channel member should be muted.
        // If they have a role `sus: <name>`, where `name` is included in `usersThatCanSpeak`
        const discordMemberCanSpeak = member.roles.cache.some((role) => {
          return usersThatCanSpeak.some(
            (user: string) => role.name === ROLE_PREFIX + user
          )
        })

        const isAdmin = member.permissions.has('ADMINISTRATOR')

        if (discordMemberCanSpeak) {
          if (isAdmin) {
            // They be admin, so we need to like "sudo unmute"
            await member.voice.setMute(false)
          } else {
            // They can speak, so remove the overwrite that prevents them from speaking
            const permission = voiceChannel.permissionOverwrites.find(
              (value) => {
                return value.type === 'member' && value.id === member.user.id
              }
            )

            await permission?.delete()
          }
        } else {
          // They cannot speak, so create an overwrite permission
          if (isAdmin) {
            await member.voice.setMute(true)
          } else {
            await voiceChannel.createOverwrite(member.user, { SPEAK: false })
          }
        }

        // Move them from this channel to... this channel, to refresh their (in)ability to speak
        await member.voice.setChannel(voiceChannel)
      })
    )

    // Mute (but not server mute) everyone
    return res.sendStatus(200)
  })

  // Unmutes everyone by removing all of the SPEAK: false overwrites
  router.post('/unmute', async (req, res) => {
    const { voiceChannelId } = req.body

    // Look up the voice channel by ID
    const voiceChannel = (await bot.channels.fetch(
      voiceChannelId
    )) as VoiceChannel
    if (voiceChannel.type !== 'voice') return res.sendStatus(418)

    // Find all permission overwrites that are only for a user
    const permissions = voiceChannel.permissionOverwrites.filter((value) => {
      return value.type === 'member'
    })

    // Remove all user overwrites
    await Promise.all(
      permissions.map(async (permission) => permission.delete())
    )

    await Promise.all([
      ...(voiceChannel.members.map(async (member) => {
        if (member.permissions.has('ADMINISTRATOR')) {
          await member.voice.setMute(false)
        }
      }) as Promise<any>[]),
      ...voiceChannel.members.map((member) =>
        member.voice.setChannel(voiceChannel)
      ),
    ])

    return res.sendStatus(200)
  })

  return router
}
