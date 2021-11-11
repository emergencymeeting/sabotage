import { Bot } from '../lib/bot'

const mapUrls: { [key: string]: string } = {
  skeld: 'https://cdn.discordapp.com/attachments/420010319281127434/794073908054982696/ibx41dpjgnu51.png',
  mira: 'https://cdn.discordapp.com/attachments/420010319281127434/794073956721098772/qezv9ppjgnu51_1.png',
  polus: 'https://cdn.discordapp.com/attachments/420010319281127434/794073991135756329/0d6icnpjgnu51.png',
  airship: 'https://cdn.discordapp.com/attachments/770436254663180321/827768010575970315/1617277190-744-capture-d-ecran.png',
}

/**
 * Running `.map <name>` sends the relevant map image to the channel
 */
export function map(bot: Bot) {
  bot.command('map', async (mapName, msg) => {
    if (!mapUrls.hasOwnProperty(mapName)) {
      return msg.channel.send(
        `${mapName} is not a valid map! Try \`skeld\`, \`mira\`, \`polus\` or \`airship\`.`
      )
    }

    const mapFile = mapUrls[mapName]
    return msg.channel.send({ files: [mapFile] })
  })
}
