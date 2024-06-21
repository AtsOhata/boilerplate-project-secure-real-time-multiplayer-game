class Collectible {
  constructor({ x, y, value, id }) {
    const type = Math.floor(Math.random() * Math.floor(4));
    this.x = x;
    this.y = y;
    this.value = type;
    this.id = id;
    this.type = type;
    this.width = 20;
    this.height = 20;
  }

  // 再配置
  relocate(canvasWidth, canvasHeight) {
    this.x = Math.floor(Math.random() * (canvasWidth - this.width));
    this.y = Math.floor(Math.random() * (canvasHeight - this.height));
    const type = Math.floor(Math.random() * Math.floor(4));
    this.type = type;
    this.value = type;
  }
}

/*
  Note: Attempt to export this for use
  in server.js
*/
try {
  module.exports = Collectible;
} catch (e) { }

export default Collectible;
