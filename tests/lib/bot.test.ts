import { Signale } from 'signale'
import { Message, ClientUser, TextChannel, User } from 'discord.js'
import { Bot } from '../../src/lib/bot'
import MessageError from '../../src/lib/message-error'

describe('Bot', () => {
  let bot: Bot

  beforeEach(() => {
    bot = new Bot()
    bot.log = new Signale({ disabled: true })
    bot.user = { id: 'BOT' } as ClientUser
  })

  describe('#isSelf', () => {
    it('returns `true` if the message was sent by the bot', () => {
      expect(bot.isSelf({ author: { id: bot.user!.id } } as Message)).toBe(true)
    })

    it('returns `false` if the message was sent not by the bot', () => {
      expect(
        bot.isSelf({ author: { id: 'JASON HELLO' } as User } as Message)
      ).toBe(false)
    })
  })

  describe('#load', () => {
    it('loads the provided functions', async () => {
      bot.log.info = jest.fn()
      const funcs = {
        someFunction: jest.fn(async (bot) => bot.log.info('I loaded!')),
      }
      await bot.load(funcs)
      expect(funcs.someFunction).toHaveBeenCalled()
      expect(bot.log.info).toHaveBeenCalled()
    })
  })

  describe('#respondWithError', () => {
    it('calls msg.channel.send with the error message', async () => {
      const msg = {
        channel: { send: jest.fn() as unknown } as TextChannel,
      } as Message
      await bot.respondWithError(new MessageError('Oh no!'), msg)

      expect(msg.channel.send).toHaveBeenCalled()
      const call = (msg.channel.send as jest.Mock).mock.calls[0]
      expect(call).toMatchSnapshot()
    })

    it('does not call msg.channel.send if the error is not a MessageError', async () => {
      const msg = {
        channel: { send: jest.fn() as unknown } as TextChannel,
      } as Message
      await bot.respondWithError(new Error('Oh no!'), msg)
      expect(msg.channel.send).not.toHaveBeenCalled()
    })
  })

  describe('#onMatch', () => {
    it('registers a `message` event handler that ignores messages sent by itself', () => {
      const spy = jest.fn(async () => {})
      bot.onMatch(/.*/, spy)
      bot.emit('message', { author: { id: bot.user!.id } } as Message)
      expect(spy).not.toHaveBeenCalled()
    })

    it('registers a `message` event handler with a RegEx', () => {
      const spy = jest.fn(async () => {})
      bot.onMatch(/^test$/, spy)
      // Should call the spy
      bot.emit('message', {
        cleanContent: 'test',
        author: { id: 'JASON' },
      } as Message)
      // Should not call the spy
      bot.emit('message', {
        cleanContent: 'nope',
        author: { id: 'JASON' },
      } as Message)
      expect(spy).toHaveBeenCalledTimes(1)
    })
  })

  describe('#command', () => {
    it('runs the handler for a matching command message', () => {
      const spy = jest.fn()
      bot.command('hello', spy)
      const msg = {
        cleanContent: '.hello Jason',
        author: { id: 'JASON' },
      } as Message
      bot.emit('message', msg)
      expect(spy).toHaveBeenCalled()
      expect(spy).toHaveBeenCalledWith('Jason', msg)
    })

    it('runs the handler for a matching command message without arguments', () => {
      const spy = jest.fn()
      bot.command('hello', spy)
      const msg = { cleanContent: '.hello', author: { id: 'JASON' } } as Message
      bot.emit('message', msg)
      expect(spy).toHaveBeenCalled()
      expect(spy).toHaveBeenCalledWith('', msg)
    })

    it('does not run the handler for a partially matching command', () => {
      const spy = jest.fn()
      bot.command('hello', spy)
      const msg = {
        cleanContent: '.hellofresh',
        author: { id: 'JASON' },
      } as Message
      bot.emit('message', msg)
      expect(spy).not.toHaveBeenCalled()
    })
  })
})
