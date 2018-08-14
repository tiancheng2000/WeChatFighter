
export default class Util {
  
  //point: {x, y},  area: {startX, startY, endX, endY}
  static inArea(point, area){
    return (point.x >= area.startX
      && point.x <= area.endX
      && point.y >= area.startY
      && point.y <= area.endY)
  }

  static findNext(arr, value){
    for (let i = 0; i < arr.length; i++) {
      if (arr[i] === value) {
        return arr[(i + 1) % arr.length]
      }
    }
    return undefined
  }
  
}