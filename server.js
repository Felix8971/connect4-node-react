var fs = require('fs');
var path = require('path');
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var server = require('http').Server(app);

// initializing express-session middleware
// var Session = require('express-session');
// var SessionStore = require('session-file-store')(Session);
// var session = Session({store: new SessionStore({path: __dirname+'/sessions'}), secret: 'pass', resave: true, saveUninitialized: true});

//var COMMENTS_FILE = path.join(__dirname, 'comments.json');

var port = process.env['PORT'] || 3000;

app.use('/', express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
//app.use(session);

// voir https://github.com/xpepermint/socket.io-express-session/tree/master/example
var ios = require('socket.io-express-session');
var io = require('socket.io')(server);
//io.use(ios(session)); // session support
db = require('./db');//module à part pour gerer les acces bdd
var url_mongo = 'mongodb://localhost:27017/connect4';//27017 est le port par defaut pour mongodb si on ne le precise pas. On peut passer plusieurs hotes pour acceder à des bases sur plusieures serveurs
var players = {};
var _socket = null;


setInterval(function(){
  console.log('players list=>',players);
},4000);

//players["s6546r5f4"] = { pseudo:"toto", sid:"s6546r5f4", dispo:true, opponent_sid:null, img:'human.png' };

var getIdFromPseudo = function(pseudo, players){
  for ( var prop in players) {
    //console.log("x=",players[prop].pseudo);
    if( players[prop].pseudo === pseudo){
      return players[prop].sid;//return prop would also work
    }
  }
  return null;
};

//pseudo ask players list to the server
app.get('/api/getplayers', function(req, res) {
  console.log("/api/getplayers");
  res.json(players);
});



db.connect(url_mongo, function(err){
  if (err) {
      console.log('Impossible de se connecter à la base de données Connect4.');
      process.exit(1);
  }
});


// Socket.IO part used for multiplayer game

var try2LaunchGame = function(){
  console.log('try2LaunchGame'); 
  for ( var prop1 in players) {
    var player1 = players[prop1];
    //console.log('prop::',prop);
    if ( player1.dispo ){//&& player.pseudo != req.params.pseudo      
      for ( var prop2 in players) {
        var player2 = players[prop2];
        if ( player2.sid != player1.sid && player2.dispo ){
        
          players[player1.sid].dispo = false;
          players[player1.sid].opponent_sid = player2.sid;
          players[player2.sid].dispo = false;
          players[player2.sid].opponent_sid = player1.sid;
          
          //we tell the 2 players that the game start
          var socket;
          
          socket = clients[player1.sid];
          socket.emit('start-game',player2.sid, players);
          
          socket = clients[player2.sid];
          socket.emit('start-game',player1.sid, players);
         
          break;
        }
      }
    }
  }   
}

 //io.sockets.emit('majPlayers', players);//send to all clients



//We look every second if we find 2 players available for a game, if so we start the game
//setInterval(function(){
  //io.sockets.emit('majPlayers', players);//send to all clients
  //try2LaunchGame();
//},1000);


var clients = {};

io.on('connection', function (socket) {
  
  //_socket =  socket;//_socket will be is available inside routes if needed

  clients[socket.id] = socket;

  console.log('New client connected!');
  //socket.emit("connection");
  //we send the users list to the client when he arrives
  //io.sockets.emit('majPlayers', players);

  console.log('players=',players);

  socket.on('addPlayer', function (pseudo) {
    console.log('addPlayer '+pseudo);
    players[socket.id] = { pseudo:pseudo, sid:socket.id, dispo:true, opponent_sid:null, img:'human.png' };
    console.log('players list=',players);
    //socket.handshake.session.pseudo = pseudo;
    io.sockets.emit('majPlayers', players);//send to all clients
    try2LaunchGame();
  });
  
  //if a user leave the game we remove him from users list and we inform other clients
  socket.on('leaveGame', function(){
    if ( typeof players[socket.id] != "undefined" ){
      //if socket.id was playing we declare his opponent available so that he could be pick by the server to play again
      if ( players[socket.id].opponent_sid ){
        players[players[socket.id].opponent_sid].dispo = true;
        players[players[socket.id].opponent_sid].opponent_sid = null;
      }
    }
    delete players[socket.id];
    console.log('players=',players);
    io.sockets.emit('majPlayers', players);//send to all clients 
    //io.sockets.emit('remove-player', socket.id);//send to all clients 
  });  


});

server.listen(port, function(){
    var addressHost = server.address().address;
    console.log('L\'application est disponible à l\'adresse http://%s:%s', addressHost, port);
});


// app.post('/api/comments', function(req, res) {
//   fs.readFile(COMMENTS_FILE, function(err, data) {
//     if (err) {
//       console.error(err);
//       process.exit(1);
//     }
//     var comments = JSON.parse(data);
//     // NOTE: In a real implementation, we would likely rely on a database or
//     // some other approach (e.g. UUIDs) to ensure a globally unique id. We'll
//     // treat Date.now() as unique-enough for our purposes.
//     var newComment = {
//       id: Date.now(),
//       author: req.body.author,
//       text: req.body.text,
//     };
//     comments.push(newComment);
//     fs.writeFile(COMMENTS_FILE, JSON.stringify(comments, null, 4), function(err) {
//       if (err) {
//         console.error(err);
//         process.exit(1);
//       }
//       res.json(comments);
//     });
//   });
// });


// var sendComments = function (socket) {
  //   fs.readFile('_comments.json', 'utf8', function(err, comments) {
  //     comments = JSON.parse(comments);
  //     socket.emit('comments', comments);
  //   });
  // };
  // socket.on('fetchComments', function () {
  //   sendComments(socket);
  // });

  // socket.on('newComment', function (comment, callback) {
  //   fs.readFile('_comments.json', 'utf8', function(err, comments) {
  //     comments = JSON.parse(comments);
  //     comments.push(comment);
  //     fs.writeFile('_comments.json', JSON.stringify(comments, null, 4), function (err) {
  //       io.emit('comments', comments);
  //       callback(err);
  //     });
  //   });
  // });