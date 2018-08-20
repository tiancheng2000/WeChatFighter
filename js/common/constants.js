//Constants.js

//Speed: per second
//SpawnRate: per second
//UpdateRate: per second

module.exports = {
  Enemy: {
    Speed: 6,
    SpawnRate: 2  //per second
  },

  Bullet: {
    //Speed: configurable = true
    SpawnRate: 3,
    Types: ['single', 'double', 'triple', 'quadruple', 'quintuple'],
    SpeedBase: 10
  },

  Floatage:{
    Speed: 3 * 60,
    SpawnRate: 0.2,
    AnimUpdateRate: 4
  }

}
