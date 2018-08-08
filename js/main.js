import Player from './player/index'
import Enemy from './npc/enemy'
import BackGround from './runtime/background'
import GameInfo from './runtime/gameinfo'
import Music from './runtime/music'
import DataBus from './databus'
import Config from './common/config'

let ctx = canvas.getContext('2d')
let databus = new DataBus()

//const UpdateRate = require('./common/config.js').UpdateRate

/**
 * 游戏主函数
 */
export default class Main {
  constructor() {

    //1.两个主循环
    this.renderLoopId = 0
    this.bindloopRender = this.loopRender.bind(this)
    this.updateInterval = 1000 / Config.UpdateRate
    this.bindloopUpdate = this.loopUpdate.bind(this)

    //2.不需重置的游戏数据
    //...

    //3.初次/重新启动
    this.restart()

    //4.其他：转发、广告...
    wx.showShareMenu()
    wx.updateShareMenu({
      withShareTicket: true
    })
    wx.onShareAppMessage(function () {
      return {
        title: '增强版飞机大战',
        imageUrl: canvas.toTempFilePathSync({
          destWidth: 500,
          destHeight: 900
        })
      }
    })
    let bannerAd = wx.createBannerAd({
      adUnitId: 'xxxx', //迷の广告商人...
      style: {
        left: 10,
        top: 76,
        width: 320
      }
    })
    bannerAd.show()
  }

  restart() {
    databus.reset()

    //1.玩家操控事件
    canvas.removeEventListener(
      'touchstart',
      this.touchHandler
    )
    //this.hasEventBind = false  //IMPROVE

    //2.需重置的游戏数据
    this.bg = new BackGround(ctx)
    this.player = new Player(ctx)
    this.gameinfo = new GameInfo()
    this.music = new Music()

    //3.两个主循环
    if (this.updateTimer)
      clearInterval(this.updateTimer)
    this.updateTimer = setInterval(
      this.bindloopUpdate,
      this.updateInterval
    )
    if (this.renderLoopId != 0)
      window.cancelAnimationFrame(this.renderLoopId);
    this.renderLoopId = window.requestAnimationFrame(
      this.bindloopRender,
      canvas
    )
  }

  /**
   * 随着帧数变化的敌机生成逻辑
   * 帧数取模定义成生成的频率
   */
  enemyGenerate() {
    if (databus.frame % 30 === 0) {
      let enemy = databus.pool.getItemByClass('enemy', Enemy)
      enemy.init(6)
      databus.enemys.push(enemy)
    }
  }

  // 全局碰撞检测
  collisionDetection() {
    let that = this

    databus.bullets.forEach((bullet) => {
      for (let i = 0, il = databus.enemys.length; i < il; i++) {
        let enemy = databus.enemys[i]

        if (!enemy.isPlaying && enemy.isCollideWith(bullet)) {
          enemy.playAnimation()
          that.music.playExplosion()

          bullet.visible = false
          databus.score += 1

          break
        }
      }
    })

    for (let i = 0, il = databus.enemys.length; i < il; i++) {
      let enemy = databus.enemys[i]

      if (this.player.isCollideWith(enemy)) {
        databus.gameOver = true

        break
      }
    }
  }

  //-- 游戏【操控】事件处理 ----
  touchEventHandler(e) {
    e.preventDefault()

    let x = e.touches[0].clientX
    let y = e.touches[0].clientY

    let area = this.gameinfo.btnArea

    if (x >= area.startX
      && x <= area.endX
      && y >= area.startY
      && y <= area.endY)
      this.restart()
  }

  //-- 游戏数据【更新】主函数 ----
  update(timeElapsed) {
    if (databus.gameOver)
      return;

    this.bg.update()

    databus.frame++  //IMPROVE
    databus.bullets
      .concat(databus.enemys)
      .forEach((item) => {
        item.update()
      })

    this.enemyGenerate()

    this.collisionDetection()

    if (databus.frame % 20 === 0) {
      this.player.shoot()
      this.music.playShoot()
    }
  }

  //-- 游戏数据【渲染】主函数 ----
  render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    this.bg.render(ctx)

    databus.bullets
      .concat(databus.enemys)
      .forEach((item) => {
        item.drawToCanvas(ctx)
      })

    this.player.drawToCanvas(ctx)

    databus.animations.forEach((ani) => {
      if (ani.isPlaying) {
        ani.aniRender(ctx)
      }
    })

    this.gameinfo.renderGameScore(ctx, databus.score)

    // 游戏结束停止帧循环
    if (databus.gameOver) {
      this.gameinfo.renderGameOver(ctx, databus.score)

      if (!this.hasEventBind) {
        this.hasEventBind = true
        this.touchHandler = this.touchEventHandler.bind(this)
        canvas.addEventListener('touchstart', this.touchHandler)
      }
    }
  }


  //-- 游戏数据【更新】主循环 ----
  loopUpdate() {
    let timeElapsed = new Date().getTime() - this.lastUpdateTime
    this.lastUpdateTime = new Date().getTime()
    this.update(timeElapsed)
  }

  //-- 游戏数据【渲染】主循环 ----
  loopRender() {
    this.render()
    this.renderLoopId = window.requestAnimationFrame(
      this.bindloopRender,
      canvas
    )
  }

}
