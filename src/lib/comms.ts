import express from 'express'
import { VoiceChannel } from 'discord.js'
import { Bot } from './bot'
import { ROLE_PREFIX } from '../functions/claim'

export default (bot: Bot) => {
  const router = express.Router()

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

        if (discordMemberCanSpeak) {
          // They can speak, so remove the overwrite that prevents them from speaking
          const permission = voiceChannel.permissionOverwrites.find((value) => {
            return value.type === 'member' && value.id === member.user.id
          })

          await permission?.delete()
        } else {
          // They cannot speak, so create an overwrite permission
          await voiceChannel.createOverwrite(member.user, { SPEAK: false })
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

    return res.sendStatus(200)
  })

  return router
}
