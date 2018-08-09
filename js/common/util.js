
export default class Util {
  
  //point: {x, y},  area: {startX, startY, endX, endY}
  static inArea(point, area){
    return (point.x >= area.startX
      && point.x <= area.endX
      && point.y >= area.startY
      && point.y <= area.endY)
  }
  
}