const Discord = require('discord.js')
const glob = require('glob')
const path = require('path')

const logger = new (require('../Utils/terminal.js'))(__filename)

const Intents = Discord.Intents.FLAGS
const hgd = require('../Utils/hgdUtils')

const registerHgdCommands = require('./HgdCmdReg')

module.exports = class Client extends Discord.Client {
  constructor () {
    super({
      intents: [
        Intents.GUILDS,
        Intents.GUILD_MEMBERS,
        Intents.GUILD_INVITES,
        Intents.GUILD_MESSAGES,
        Intents.GUILD_MESSAGE_REACTIONS,
        Intents.DIRECT_MESSAGES,
        Intents.DIRECT_MESSAGE_REACTIONS
      ]
    })
    this.commands = new Discord.Collection()
    this.themeColor = '#ACE9A6'
    this.timezoneOffset = 0
    this.colors = {
      red: '#E3B2B2',
      yellow: '#EED896',
      green: '#97E1B3',
      blue: '#8EC0D8',
      purple: '#CFBAEA'
    }
    this.prefix = '-'
    this.modChannelID = '801305387826806804'
  }

  setPlr (player) {
    this.player = player
  }

  registerCommands () {
    const commands = glob.sync(path.resolve('commands/**/*.js'))
    logger.info(`Loading ${commands.length} commands (normal)`)

    for (const commandPath of commands) {
      const File = require(commandPath)
      let cmd
      try {
        cmd = new File(this)
      } catch (e) {
        logger.error(`Cannot create "File" for ${commandPath}`)
        stopFile()
      }
      function stopFile () {
        throw new Error('Stop registering Commands')
      }

      this.commands.set(cmd.name, cmd)
    }

    const hgdCommands = registerHgdCommands(this)
    logger.info(`Loading ${hgdCommands.length} commands (Hgd)`)
    for (const command of hgdCommands) {
      this.commands.set(command.name, command)
    }

    logger.info(`Finished loading ${this.commands.size} commands`)

    return this.commands
  }

  registerEvents () {
    const events = glob.sync(path.resolve('./../Jane/events/*.js'))
    logger.info(`Loading ${events.length} events...`)

    let i = 0

    for (const event of events) {
      const File = require(event)
      const evt = new File(this)

      this.on(evt.name, (...args) => {
        evt.run(...args)
      })

      i++
    }

    logger.info(
      `Now listening to the following ${i} events:\n${this.eventNames().join(
        ' '
      )}`
    )
  }

  async logIn (startInDev = false) {
    if (startInDev) this.prefix = '--'
    this.registerCommands()
    this.registerEvents()
    await hgd.connectClient()
    logger.info('MongoDB Client connected!')
    this.login(startInDev ? process.env.DEVTOKEN : process.env.TOKEN)
  }
}
