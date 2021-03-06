const Evt = require('../core/e')
const Util = require('../Utils/index.js')

const logger = Util.getLogger(__filename)

const { MessageEmbed } = require('discord.js')

module.exports = class Ready extends Evt {
  constructor (client) {
    super(client, 'ready')
  }

  async run () {
    /* this.client.user
      .setActivity('現已開放程式原始碼: https://github.com/Kai9073/jane', { type: 'PLAYING' })
      .then(presence => console.log('Status set'))
      .catch(console.error)
      */

    logger.info('Finished loading client - bot has started')

    this.client.channels
      .fetch('921544138887929886')
      .then(ch => ch.send('Bot has started!'))

    this.client.player.on('botDisconnect', message => {
      logger.info('Player emitted botDisconnect Event')
      logger.info(`Message > ${message.author.tag} : ${message.content}`)
    })

    this.client.player.on('error', (error, message) => {
      message.reply(Util.errEmbed(message, `發生了一個錯誤\n\`${error}\``))
      logger.error(error)
      logger.info(`Message > ${message.author.tag} : ${message.content}`)
    })

    this.client.player.on('noResults', (message, query) => {
      logger.info('Player emitted noResults Event')
      const noResultsEmbed = new MessageEmbed()
        .setDescription(
          `<:redcross:842411993423413269> 找不到歌名為${query}的歌曲`
        )
        .setColor(this.client.colors.red)
      message.reply({ embeds: [noResultsEmbed] })
      logger.info(`Message > ${message.author.tag} : ${message.content}`)
    })

    this.client.player.on('playlistAdd', (message, queue, playlist) => {
      logger.info('Player emitted playlistAdd Event')
      logger.info(playlist)
      const playlistAddEmbed = new MessageEmbed()
        .setDescription(
          `:white_check_mark: 已經把 ${playlist.title} 內共${playlist?.tracks?.length}首歌曲加入播放清單`
        )
        .setColor(this.client.colors.green)
      message.reply({ embeds: [playlistAddEmbed] })
      logger.info(`Message > ${message.author.tag} : ${message.content}`)
    })

    this.client.player.on('playlistParseEnd', (playlist, message) => {
      logger.info('Player emitted playlistParseEnd Event')
      logger.info(`Message > ${message.author.tag} : ${message.content}`)
    })

    this.client.player.on('playlistParseStart', (playlist, message) => {
      logger.info('Player emitted playlistParseStart Event')
      message.reply(':mag: 正在載入播放清單資訊')
      logger.info(`Message > ${message.author.tag} : ${message.content}`)
    })

    this.client.player.on('queueEnd', (message, queue) => {
      logger.info('Player emitted queueEnd Event')
      const queueEndEmbed = new MessageEmbed()
        .setDescription('<:leave:842411018503061554> 所有歌曲已播放完畢')
        .setColor(this.client.colors.red)
      message.channel.send({ embeds: [queueEndEmbed] })
      logger.info(`Message > ${message.author.tag} : ${message.content}`)
    })

    this.client.player.on('searchCancel', (message, query, tracks) => {
      logger.info('Player emitted searchCancel Event')
      message.reply(
        `搜尋\`${query}\`時載入過長, 請稍後再試\n(如情況持續可聯絡程序員)`
      )
      logger.info(`Message > ${message.author.tag} : ${message.content}`)
    })

    this.client.player.on(
      'searchInvalidResponse',
      (message, query, tracks, invalidResponse, collector) => {
        logger.info('Player emitted searchInvalidResponse Event')
        message.reply(Util.errEmbed(message, '發生了一個預期外的錯誤'))
        logger.info(`Message > ${message.author.tag} : ${message.content}`)
      }
    )

    this.client.player.on(
      'searchResults',
      (message, query, tracks, collector) => {
        logger.info('Player emitted searchResults Event')
        logger.info(`Message > ${message.author.tag} : ${message.content}`)
      }
    )

    this.client.player.on('trackAdd', (message, queue, track) => {
      logger.info('Player emitted trackAdd Event')
      const trackAddEmbed = new MessageEmbed()
        .setAuthor({
          name: '歌曲已加入播放列表',
          iconURL: track.requestedBy.displayAvatarURL
        })
        .setDescription(
          `[${track.title}](${track.url})\n:clock7: 長度 > ${track.duration}`
        )
        .setColor(this.client.colors.green)
      message.reply({ embeds: [trackAddEmbed] })
      logger.info(`Message > ${message.author.tag} : ${message.content}`)
    })

    this.client.player.on('trackStart', (message, track) => {
      const queue = this.client.player.getQueue(message).tracks
      logger.info(queue[1])
      logger.info(track)
      logger.info('Player emitted trackStart Event')
      const trackStartEmbed = new MessageEmbed()
        .setAuthor({
          name: '正在播放',
          iconURL: track.requestedBy.displayAvatarURL
        })
        .setDescription(
          `[${track.title}](${track.url})\n\n:clock7: > ${track.duration}\n<:profile:842405731591913492> > ${track.requestedBy.tag}`
        )
        .setColor(this.client.colors.blue)
        .setThumbnail(track.thumbnail)
      if (queue[1]) {
        trackStartEmbed.setFooter(
          `下一首 : ${queue[1]?.title}`,
          queue[1]?.thumbnail
        )
      }
      message.channel.send({ embeds: [trackStartEmbed] })
      logger.info(`Message > ${message.author.tag} : ${message.content}`)
    })
  }
}
