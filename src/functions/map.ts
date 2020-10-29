import { Bot } from '../lib/bot'

const mapUrls: { [key: string]: string } = {
  skeld: '',
  mira: '',
  polus: '',
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
