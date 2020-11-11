import { Bot } from '../lib/bot'

export const ROLE_PREFIX = 'sus: '

/**
 * Running `.claim <name>` creates and sets a role for the message author.
 * This is used to map Discord names to in-game names.
 */
export function claim(bot: Bot) {
  bot.command('claim', async (name, msg) => {
    const newRoleName = ROLE_PREFIX + name

    // Check if someone else already has this sus role
    const allRoles = (await msg.guild!.roles.fetch()).cache
    if (allRoles.some((role) => role.name === newRoleName)) {
      return msg.channel.send(`Sorry ${msg.author}, I can't let you do that`)
    }

    // Delete any other sus-roles they have
    const susRoles = msg.member!.roles.cache.filter((role) =>
      role.name.startsWith(ROLE_PREFIX)
    )
    await Promise.all(
      susRoles.map(async (role) => {
        return role.delete()
      })
    )

    // Create the new role of `sus: <name>`
    const role = await msg.guild!.roles.create({
      data: { name: newRoleName },
    })

    // Give the user the role
    await msg.member!.roles.add(role)

    // Let 'em know
    return msg.channel.send(
      `${msg.author}, I've given you the role \`${role.name}\``
    )
  })
}
