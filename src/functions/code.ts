import { Bot } from '../lib/bot'

const codeRegex = /^[A-Za-z]{6}$/
const channelNumberRegex = /^#(?<number>\d+)/

const defaultChannels = ['afk', 'mod-lounge', '+ New Game']
const defaultRoomNum = 3
for (let i = 0; i < defaultRoomNum; i++) {
  defaultChannels.push(`#${i + 1}`)
}

/**
 * Manages Among Us voice channel names by appending/removing
 * a lobby code from the channel name.
 */
export function code(bot: Bot) {
  // .code <number> <code>
  bot.command('code', async (args, msg) => {
    if (!msg.guild) return

    // Get the number, code, and regionCode
    let [number, code, regionCode] = args.split(' ')

    // User is trying to use shorthand with code and regionCode. Args need to be shifted over.
    if (number?.length === 6 && code?.length === 2 && !regionCode) {
      regionCode = code
      code = ''
    }

    // If someone uses shorthand syntax (.code CODEEE)
    if (!code) {
      if ((number && codeRegex.test(number)) || number === 'reset') {
        // Get the author
        const author = await msg.guild.members.fetch(msg.author.id)
        // See if they are in any voice channels
        if (!author.voice.channel?.name) {
          // If someone is not in a voice channel, don't allow shorthand, end here so there's no double message
          return bot.replyWithError(
            `You must be in a voice channel, or use \`.code [channel number] [code]\` (example: \`.code 2 ASDQWD\`)`,
            msg
          )
        }
        // Get the channel name and number
        const channelName = author.voice.channel?.name
        const match = channelName.match(channelNumberRegex)
        // Assign shorthand variables to default behavior
        if (match?.groups?.number) {
          code = number === 'reset' ? '' : number
          number = match?.groups?.number
        }
      } else if (!new RegExp(/^\d+$/).test(number)) {
        // If the code is not valid, let the next message be sent
        code = number
      }
    }

    // If there is a code and its invalid, tell them
    if (code && !codeRegex.test(code)) {
      return bot.replyWithError(
        `**\`${code}\`** is not a valid code (6 letters)`,
        msg
      )
    }

    // Find the voice channel named `Game <number>`
    const voiceChannel = msg.guild.channels.cache.find((channel) => {
      return channel.type === 'voice' && channel.name.startsWith(`#${number}`)
    })

    // No voice channel, no happiness
    if (!voiceChannel) {
      return bot.replyWithError(
        `Voice channel **#${number}** does not exist!`,
        msg
      )
    }

    if (code) {
      // Set the channel name to Game 1 (ABCDEQ)
      const uppercaseCode = `${code.toUpperCase()}${
        regionCode ? ': ' + regionCode.toUpperCase() : ''
      }`
      await voiceChannel.setName(`#${number}: ${uppercaseCode}`)
      return msg.reply(
        `Game #${number}'s invite code is now set to **\`${uppercaseCode}\`**!`
      )
    } else {
      // Set the channel name to Game 1
      await voiceChannel.setName(`#${number}`)
      return msg.reply(`Game #${number}'s invite code has been reset`)
    }
  })

  /**
   * When someone leaves the voice call, if they're the
   * last one to leave, reset the name
   */
  bot.on('voiceStateUpdate', async (oldChannel, newChannel) => {
    // Check the channel someone just left
    if (oldChannel.channel) {
      // Check if the channel they left is empty
      if (oldChannel.channel.members.size === 0) {
        // If it's not a default channel, delete it
        const isDefaultChannel = defaultChannels.some((channel) =>
          oldChannel.channel?.name.startsWith(channel)
        )
        if (!isDefaultChannel) {
          await oldChannel.channel.delete()
        } else {
          // If it is a default channel, reset its name (replace the ending `... (CODEEE)`)
          const basename = oldChannel.channel.name.replace(/\:\s[A-Z]{6}$/, '')
          await oldChannel.channel.setName(basename)
        }
      }
    }

    // Check if someone is joining a new channel
    if (newChannel.channel) {
      // If that channel is the New Game channel
      if (newChannel.channel.name === '+ New Game') {
        // Create a new New Game channel
        await newChannel.channel.clone()

        const gameChannels = newChannel.guild.channels.cache.filter(
          (channel) => channel.type === 'voice' && channel.name.startsWith(`#`)
        )

        // Find the highest channel number
        let highestChannel = 0
        for (const [_, gameChannel] of gameChannels.entries()) {
          const match = gameChannel.name.match(channelNumberRegex)
          if (!match || !match.groups) continue

          highestChannel = Math.max(highestChannel, Number(match.groups.number))
        }

        // Turn the current one into another game channel
        await newChannel.channel.edit({
          name: `#${highestChannel + 1}`,
          userLimit: 99,
        })
      }
    }
  })
}

// TODO: REMOVE DEFAULT CHANNELS and only delete if channel starts with #
// and isn't in default cap (1-3)
