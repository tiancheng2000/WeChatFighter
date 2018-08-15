
let frame_proto = {
  image: new Image(),
  srcX: 0,
  srcY: 0,
  width: 0,
  height: 0,
  offsetX: 0, //add it to destX
  offsetY: 0
}

export default class AnimationBuilder {
  constructor() {
  }

  //初始化方式一：从图片路径数组初始化
  static initFramesFromPaths(imagePathList) {
    let frames = []
    imagePathList.forEach((imageSrc) => {
      let image = new Image()
      image.src = imageSrc
      image.onload = () => {
        let frame = {
          image: image,
          srcX: 0,
          srcY: 0,
          width: image.width,
          height: image.height,
          offsetX: 0,
          offsetY: 0
        }
        frames.push(frame)
      }
    })
    return frames
  }

  //初始化方式二：从ATLAS图片及数据初始化（for骑士巡游）
  static initFramesFromAtlas(atlasImage, atlasTexture, frameNames) {
    let frames = []
    let frame
    for (let i = 0; i < frameNames.length; i++) {
      atlasFrame = this.atlasTexture.frames[frameNames[i]];
      if (atlasFrame) {
        let frame = {
          image: atlasImage,
          srcX: atlasFrame.x,
          srcY: atlasFrame.y,
          width: atlasFrame.width,
          height: atlasFrame.height,
          offsetX: atlasFrame.offsetX,
          offsetY: atlasFrame.offsetY
        }
        this.frames.push(frame);
      }
    }
    return frames
  }

}

