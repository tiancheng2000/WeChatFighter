//Constants.js

//Speed: 1.per update 2.per second (if use MotionTrack class)
//SpawnRate: per second
//UpdateRate: per second

module.exports = {
  Enemy: {
    Speed: 6,  //以一次更新为单位
    SpawnRate: 2  //per second
  },

  Bullet: {
    //Speed: configurable = true
    SpawnRate: 3,
    Types: ['single', 'double', 'triple', 'quadruple', 'quintuple'],
    SpeedBase: 10  //以一次更新为单位
  },

  Floatage:{
    Speed: 3 * 60,  //采用MotionTrack类的实体，其速度是真正以秒为单位
    SpawnRate: 0.2,
    SpawnMax: 3,
    AnimUpdateRate: 4
  },

  Directions:{
    //in 4
    Down: 0,
    Left: 1,
    Right: 2,
    Up: 3,
    //in 8
    North: 0,
    NE: 1,
    East: 2,
    SE: 3,
    South: 4,
    SW: 5,
    West: 6,
    NW: 7
  }

}
