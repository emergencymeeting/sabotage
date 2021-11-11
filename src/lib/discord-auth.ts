import passport from 'passport'

const { Strategy: DiscordStrategy } = require('passport-discord')

passport.use(
  new DiscordStrategy(
    {
      clientID: process.env.DISCORD_CLIENT_ID,
      clientSecret: process.env.DISCORD_CLIENT_SECRET,
      callbackURL: process.env.LOCAL_AUTH
        ? 'http://localhost:8080/comms/web-auth'
        : 'https://sabotagebot.azurewebsites.net/comms/web-auth',
      scope: ['identify', 'rpc'],
    },
    (_: any, __: any, profile: unknown, cb: Function) => {
      console.log(profile)
      cb(null, profile)
    }
  )
)

export default passport
