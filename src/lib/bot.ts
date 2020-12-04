import { Client, ClientOptions, Message } from 'discord.js'
import { Signale } from 'signale'

export class Bot extends Client {
  public log: Signale

  constructor(opts?: ClientOptions) {
    super(opts)
    this.log = new Signale()
  }

  /**
   * Returns true if the message was sent by the bot
   */
  public isSelf(msg: Message) {
    return msg.author.id === this.user!.id
  }

  /**
   * Load a hash of bot functions
   */
  public async load(funcs: { [key: string]: Function }) {
    // Register all the bot functions
    for (const func in funcs) {
      this.log.info(`Registering function [${func}]`)
      await funcs[func](this)
    }
  }

  /**
   * Reply to a message with an error annotation
   */
  public async replyWithError(description: string, msg: Message) {
    return msg.reply('Error:', {
      embed: {
        color: 0xff0000,
        description,
      },
    })
  }

  /**
   * An extended `client.on`, this allows for handlers to declare
   * a RegEx to match before triggering the handler and automatically
   * ignore messages sent by the bot
   */
  public onMatch(
    reg: RegExp,
    handler: (msg: Message, match: RegExpMatchArray) => Promise<unknown>
  ) {
    return this.on('message', async (msg) => {
      // Ignore message sent by the bot
      if (this.isSelf(msg)) return

      // Ensure that we've found a match
      const str = msg.cleanContent.toString()
      const match = str.match(reg)
      if (!match) return

      return handler(msg, match).catch((err: any) =>
        this.replyWithError(err.message, msg)
      )
    })
  }

  /**
   * Act on "command" messages starting with a `.`
   * chracter, like .deploy <args>.
   */
  public command(
    command: string,
    handler: (args: string, msg: Message) => Promise<unknown>
  ) {
    const COMMAND_KEY = '\\.'
    const reg = new RegExp(`^${COMMAND_KEY}${command}(?:$|\\s(.*))`)
    return this.onMatch(reg, async (msg, match) => {
      const args = match[1] || ''
      return handler(args, msg)
    })
  }
}
