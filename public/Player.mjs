class Player {
  constructor({x, y, score, id}) {
    this.x = x;
    this.y = y;
    this.score = score;
    this.id = id;
    this.width = 50;
    this.height = 50;
  }

  movePlayer(dir, speed) {
    switch (dir) {
      case 'up':
        this.y -= speed;
        break;
      case 'down':
        this.y += speed;
        break;
      case 'left':
        this.x -= speed;
        break;
      case 'right':
        this.x += speed;
        break;
      default:
        console.log('Invalid direction');
    }
  }

  collision(item) {
    if (
      this.x < item.x + item.width &&
      this.x + this.width > item.x &&
      this.y < item.y + item.height &&
      this.y + this.height > item.y
    ) {
      return true;
    }
    return false;
  }

  calculateRank(arr) {
    arr.sort((a, b) => b.score - a.score);
    const playerIndex = arr.findIndex(player => player.id === this.id) + 1;
    return "Rank: " + playerIndex + " / " + arr.length;
  }
}

export default Player;
