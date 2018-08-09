import Player from './player/index'
import Enemy from './npc/enemy'
import BackGround from './runtime/background'
import GameInfo from './runtime/gameinfo'
import Music from './runtime/music'
import DataBus from './databus'
import Config from './common/config'
import ControlLayer from './base/controllayer'

let ctx = canvas.getContext('2d')
let databus = new DataBus()

//const UpdateRate = require('./common/config.js').UpdateRate

/**
 * 游戏主函数
 */
export default class Main {
  constructor() {

    //1.两个主循环
    this.bindloopUpdate = this.loopUpdate.bind(this)
    this.bindloopRender = this.loopRender.bind(this)

    //2.不需重置的游戏数据、玩家操控处理机制
    ;//<--编译器BUG，不加";"会和下一语句拼成一句而出错
    ['touchstart', 'touchmove', 'touchend'].forEach((type) => {
      canvas.addEventListener(type, this.touchEventHandler.bind(this))
    })

    //3.初次/重新启动
    this.restart()

    //4.其他：转发、广告...
    {
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
  }

  restart() {
    databus.reset()

    //1.需重置的游戏数据、玩家操控处理机制
    this.updateInterval = 1000 / Config.UpdateRate
    this.bg = new BackGround(ctx)
    this.player = new Player(ctx)
    this.gameinfo = new GameInfo()
    this.music = new Music()
    this.ctrlLayerUI = new ControlLayer('UI', [this.gameinfo])
    this.ctrlLayerSprites = new ControlLayer('Sprites', [this.player])
    this.ctrlLayerBackground = new ControlLayer('Background', [this.bg], false)
    
    //2.两个主循环重启
    if (this.updateTimer)
      clearInterval(this.updateTimer)
    this.updateTimer = setInterval(
      this.bindloopUpdate,
      this.updateInterval
    )
    if (this.renderLoopId)
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
  touchEventHandler(e){
    e.preventDefault()
    let [x, y] = (e.type == 'touchstart' || e.type == 'touchmove') ?
      [e.touches[0].clientX, e.touches[0].clientY] : [null, null]

    //规则：1.只会从上层往下层传(只有捕获capture，没有冒泡bubble) 
    //     2.当上层发生过处理时下层不再处理(parent-catch)
    //     3.同一层中，有一个元素处理过（队头优先）其他元素即不再处理(sibling-catch)
    let upperLayerHandled = false
    ;[this.ctrlLayerUI, this.ctrlLayerSprites, this.ctrlLayerBackground]
    .forEach((ctrlLayer) => {
      if (upperLayerHandled)
        return false //stop handling
      if (!ctrlLayer.active)
        return true //next layer
      //console.log(`${e.type}: ${ctrlLayer.name}`)
      ctrlLayer.elements.some((element) => {
        //console.log(`${e.type}: ${element.__proto__.constructor.name}`)
        element.onTouchEvent(e.type, x, y, ((res) => {
          switch (res.message) {
            case 'restart':
              this.restart()
              break
          }
          if (res.message.length > 0){
            upperLayerHandled = true
            return true //if any element handled the event, stop iteration
          }
        }).bind(this))
      })
    })

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

    //即使GameOver仍可能发最后一颗子弹..仇恨的子弹..
    if (databus.frame % 20 === 0) {
      this.player.shoot()
      this.music.playShoot()
    }

    if (databus.gameOver) {
      this.ctrlLayerSprites.active = false
      this.ctrlLayerBackground.active = false
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
