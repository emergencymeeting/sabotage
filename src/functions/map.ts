import { Bot } from '../lib/bot'

const mapUrls: { [key: string]: string } = {
  skeld: '',
  mira: '',
  polus: 'https://cdn.discordapp.com/attachments/770436254663180321/771212583298531378/knmus9a2vgj51.png',
}

/**
 * Running `.map <name>` sends the relevant map image to the channel
 */
export function map(bot: Bot) {
  bot.command('map', async (mapName, msg) => {
    if (!mapUrls.hasOwnProperty(mapName)) {
      return msg.channel.send(
        `${mapName} is not a valid map! Try \`skeld\`, \`mira\` or \`polus\`.`
      )
    }

    const mapFile = mapUrls[mapName]
    return msg.channel.send({ files: [mapFile] })
  })
}
