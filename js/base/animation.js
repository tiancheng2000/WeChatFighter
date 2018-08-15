const Config = require('../common/config.js').Config

const __ = {
  age: Symbol('age'),
  MAX_AGE: Symbol('MAX_AGE'),
  frameRate: Symbol('frameRate'),
  FRAMEINTERVAL_RECIP: Symbol('FRAMEINTERVAL_RECIP'),
  explosionAnim: Symbol('explosionAnim')
}


/**
 * 简易的帧动画类实现
 */
export default class Animation {
  constructor(frames, onFinished, loop = false, frameRate = Config.UpdateRate, atlasFrameHeight = 0) {
    this.frames = frames
    this.loop = loop
    this[__.frameRate] = frameRate
    this[__.age] = undefined
    this.currIndex = undefined
    this.atlasFrameHeight = atlasFrameHeight //for 8-direction atlas
    this.onFinished = onFinished
    this[__.MAX_AGE] = frames.length * 1000 / frameRate
    this[__.FRAMEINTERVAL_RECIP] = frameRate / 1000
  }

  isStarted() {
    return this[__.age] !== undefined
  }

  isFinished() {
    return this[__.age] >= this[__.MAX_AGE]
  }

  start() {
    this[__.age] = 0
    this.currIndex = 0
  }

  stop() {
    this.loop = false
    this[__.age] = this[__.MAX_AGE]
  }

  update(timeElapsed) {
    this[__.age] += timeElapsed
    if (this.isFinished()) {
      if (this.loop)
        this.start()
      else {
        this.currIndex = this.frames.length - 1
        if (this.onFinished !== undefined)
          this.onFinished(this)
      }
    }
    else {
      this.currIndex = Math.floor(this[__.age] * this[__.FRAMEINTERVAL_RECIP])
    }
  }

  // 渲染当前帧
  render(ctx, x, y, width = 0, height = 0, alignMode = 'topleft', direction = undefined) {
    if (!this.isStarted() || this.isFinished())
      return

    let currFrame = this.frames[this.currIndex]
    //根据渲染对齐方式，修正渲染位置
    width = width == 0 ? currFrame.width : width,
    height = height == 0 ? currFrame.height : height
    if (alignMode === 'center'){
      x -= width / 2
      y -= height / 2
    }
    
    //asssert(currFrame.image)
    ctx.drawImage(
      currFrame.image,
      currFrame.srcX,
      currFrame.srcY + Number.isNaN(direction) ? direction * this.atlasFrameHeight : 0,
      currFrame.width,
      currFrame.height,
      x + currFrame.offsetX,
      y + currFrame.offsetY,
      width == 0 ? currFrame.width : width,
      height == 0 ? currFrame.height : height
    )
  }

}
