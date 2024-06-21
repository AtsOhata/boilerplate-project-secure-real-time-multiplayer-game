require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const expect = require('chai');
const cors = require('cors');
const helmet = require("helmet");

const fccTestingRoutes = require('./routes/fcctesting.js');
const runner = require('./test-runner.js');

const app = express();
app.use(helmet());
// MIMEタイプを隠す (MIMEスニッフィングを防止)
app.use(helmet.noSniff());
// XSS攻撃を防止
app.use(helmet.xssFilter());
// キャッシュを無効にするためのカスタムミドルウェア
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Surrogate-Control', 'no-store');
  next();
});
// PHPのバージョンを示すカスタムヘッダーを追加
app.use((req, res, next) => {
  res.setHeader('X-Powered-By', 'PHP 7.4.3');
  next();
});

app.use('/public', express.static(process.cwd() + '/public'));
app.use('/assets', express.static(process.cwd() + '/assets'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//For FCC testing purposes and enables user to connect from outside the hosting platform
app.use(cors({origin: '*'})); 

// Index page (static HTML)
app.route('/')
  .get(function (req, res) {
    res.sendFile(process.cwd() + '/views/index.html');
  }); 

//For FCC testing purposes
fccTestingRoutes(app);
    
// 404 Not Found Middleware
app.use(function(req, res, next) {
  res.status(404)
    .type('text')
    .send('Not Found');
});

const portNum = process.env.PORT || 3000;

// Set up server and tests
const server = app.listen(portNum, () => {
  console.log(`Listening on port ${portNum}`);
  if (process.env.NODE_ENV==='test') {
    console.log('Running Tests...');
    setTimeout(function () {
      try {
        runner.run();
      } catch (error) {
        console.log('Tests are not valid:');
        console.error(error);
      }
    }, 1500);
  }
});

module.exports = app; // For testing


// const server = http.createServer(app);
const socketIo = require('socket.io');
const io = socketIo(server);

let players = {};
let collectible;
const Collectible = require('./public/Collectible.mjs');

// 新しいCollectibleを生成する関数
function createNewCollectible() {
  const id = new Date().toString();
  const type = Math.floor(Math.random() * 5);
  collectible = new Collectible({ x: 0, y: 0, value: 0, id: id });
  collectible.relocate(640, 480);
  io.emit('updateCollectible', collectible);
}

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // 新しいプレイヤーの追加
  players[socket.id] = { x: 0, y: 0, score: 0, id: socket.id };

  // プレイヤーの位置更新
  socket.on('move', (data) => {
    const player = players[socket.id];
    if (player) {
      player.movePlayer(data.dir, data.speed);
      io.emit('updatePlayers', players);
    }
  });

  // Collectibleの収集処理
  socket.on('collectibleCollected', (data) => {
    const player = players[data.playerId];
    if (player && collectible && collectible.id === data.collectibleId) {
      player.score += collectible.type + 1;
      createNewCollectible();
      io.emit('updatePlayers', players);
    }
  });

  io.emit('updatePlayers', players);
  if (!collectible) {
    createNewCollectible();
  } else {
    io.emit('updateCollectible', collectible);
  }

  // プレイヤーの切断
  socket.on('disconnect', () => {
    console.log('A user disconnected:', socket.id);
    delete players[socket.id];
    io.emit('updatePlayers', players);
  });

});