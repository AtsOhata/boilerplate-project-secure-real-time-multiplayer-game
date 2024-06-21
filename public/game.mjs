import Player from './Player.mjs';
import Collectible from './Collectible.mjs';

const socket = io();
const canvas = document.getElementById('game-window');
const context = canvas.getContext('2d');

let players = {};
let collectibles = {};

// プレイヤー画像の読み込み
const playerImage = new Image();
const collectible1 = new Image();
const collectible2 = new Image();
const collectible3 = new Image();
const collectible4 = new Image();
playerImage.src = '../assets/player.png';
collectible1.src = '../assets/collectible_1.png';
collectible2.src = '../assets/collectible_2.png';
collectible3.src = '../assets/collectible_3.png';
collectible4.src = '../assets/collectible_4.png';

// キーの状態を追跡するオブジェクト
const keys = {
  ArrowUp: false,
  ArrowDown: false,
  ArrowLeft: false,
  ArrowRight: false
};

// キーが押されたときのイベントリスナー
window.addEventListener('keydown', (e) => {
  if (keys.hasOwnProperty(e.key)) {
    keys[e.key] = true;
  }
});

// キーが離されたときのイベントリスナー
window.addEventListener('keyup', (e) => {
  if (keys.hasOwnProperty(e.key)) {
    keys[e.key] = false;
  }
});

// プレイヤーの移動を処理する関数
function movePlayer() {
  let moved = false;
  if (keys.ArrowUp) {
    socket.emit('move', { dir: 'up', speed: 5 });
    moved = true;
  }
  if (keys.ArrowDown) {
    socket.emit('move', { dir: 'down', speed: 5 });
    moved = true;
  }
  if (keys.ArrowLeft) {
    socket.emit('move', { dir: 'left', speed: 5 });
    moved = true;
  }
  if (keys.ArrowRight) {
    socket.emit('move', { dir: 'right', speed: 5 });
    moved = true;
  }
  if (moved) {
    socket.emit('playerMoved', players[socket.id]);
  }
}

// プレイヤーとCollectibleの衝突をチェックする関数
function checkCollision() {
  if (collectible) {
    for (let id in players) {
      let player = players[id];
      if (player.collision(collectible)) {
        socket.emit('collectibleCollected', { playerId: player.id, collectibleId: collectible.id, type: collectible.type });
      }
    }
  }
}

// 描画
function draw() {
  // キャンバスをクリア
  context.clearRect(0, 0, canvas.width, canvas.height);

  // 各プレイヤーを描画
  for (let id in players) {
    let player = players[id];
    context.drawImage(playerImage, player.x, player.y, player.width, player.height);
  }

  // 各コレクティブルを描画
  for (let id in collectibles) {
    let collectible = collectibles[id];
    context.fillStyle = 'gold';
    image = null;
    if (collectible.type == 0) image = collectible1;
    else if (collectible.type == 1) image = collectible2;
    else if (collectible.type == 2) image = collectible3;
    else image = collectible4;
    context.drawImage(image, collectible.x, collectible.y, collectible.width, collectible.height);
  }

  requestAnimationFrame(draw);
}

// ソケットイベントの設定
socket.on('updatePlayers', (serverPlayers) => {
  for (let id in serverPlayers) {
    if (!players[id]) {
      players[id] = new Player(serverPlayers[id]);
    } else {
      players[id].x = serverPlayers[id].x;
      players[id].y = serverPlayers[id].y;
      players[id].score = serverPlayers[id].score;
    }
  }
});

socket.on('updateCollectibles', (serverCollectible) => {
  collectibles = new Collectible(serverCollectible);
});

// 初期描画
draw();