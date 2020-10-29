import { Bot } from '../lib/bot'

const mapUrls: { [key: string]: string } = {
  skeld: 'https://cdn.discordapp.com/attachments/771108074827808778/771213563817492510/70659-16010616511614-800.png',
  mira: 'https://cdn.discordapp.com/attachments/771108074827808778/771213863399063552/fd819-16010617043577.png',
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
