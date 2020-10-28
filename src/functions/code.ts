import { Bot } from '../lib/bot'

const codeRegex = /^[A-Za-z]{6}$/

/**
 * Manages Among Us voice channel names by appending/removing
 * a lobby code from the channel name.
 */
export function code(bot: Bot) {
  // .code <number> <code>
  bot.command('code', async (args, msg) => {
    if (!msg.guild) return

    // Get the number and code
    const [number, code] = args.split(' ')

    // If there is a code and its invalid, tell them
    if (code && !codeRegex.test(code)) {
      return msg.channel.send(`**\`${code}\`** is not a valid code (6 letters)`)
    }

    // Find the voice channel named `Game <number>`
    const voiceChannel = msg.guild.channels.cache.find((channel) => {
      return (
        channel.type === 'voice' && channel.name.startsWith(`Game ${number}`)
      )
    })

    // No voice channel, no happiness
    if (!voiceChannel) {
      return msg.channel.send(
        `Voice channel **Game ${number}** does not exist!`
      )
    }

    if (code) {
      // Set the channel name to Game 1 (ABCDEQ)
      const uppercaseCode = code.toUpperCase()
      await voiceChannel.setName(`Game ${number} (${uppercaseCode})`)
      return msg.channel.send(
        `Game ${number}'s invite code is now set to **\`${uppercaseCode}\`**!`
      )
    } else {
      // Set the channel name to Game 1
      await voiceChannel.setName(`Game ${number}`)
      return msg.channel.send(`Game ${number}'s invite code has been reset`)
    }
  })

  /**
   * When someone leaves the voice call, if they're the
   * last one to leave, reset the name
   */
  bot.on('voiceStateUpdate', (voiceState) => {
    if (!voiceState.channel) return
    // Someone left the voice call, check that its empty now
    if (voiceState.channel.members.size !== 0) return
    // Reset the name (replaces the ending `... (CODEEE)`)
    const basename = voiceState.channel.name.replace(/\s\([A-Z]{6}\)$/, '')
    return voiceState.channel.setName(basename)
  })
}
