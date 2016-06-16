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

var port = process.env['PORT'] || 8080;

app.use('/', express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
//app.use(session);

// voir https://github.com/xpepermint/socket.io-express-session/tree/master/example
var ios = require('socket.io-express-session');
var io = require('socket.io')(server);
//io.use(ios(session)); // session support
var db = require('./db');//module à part pour gerer les acces bdd

//var url_mongo = 'mongodb://localhost:27017/connect4';//27017 est le port par defaut pour mongodb si on ne le precise pas. On peut passer plusieurs hotes pour acceder à des bases sur plusieures serveurs

var players = {};//players list
var games = {};//list of the current games

var _socket = null;
var urlConnect4MP = "http://localhost:8080"; //"http://www.felixdebon.fr"; //dev
//var  urlConnect4MP = "http://www.felixdebon.fr"; //prod

// setInterval(function(){
//   console.log('players list=>',players);
// },4000);

//players["s6546r5f4"] = { pseudo:"toto", sid:"s6546r5f4", dispo:true, opponent_sid:null, img:'human.png' };



//ask players list to the server (use by the client to check if a pseudo is free)
app.get('/connect4/getplayers', function(req, res) {
  //console.log("/connect4/getplayers");
  res.json(players);
});

// db.connect(url_mongo, function(err){
//   if (err) {
//     console.log('Cannot connect to mongodb database Connect4 !');
//     process.exit(1);
//   }
// });

// Socket.IO part used for multiplayer game


//try to find 2 users ready for a game, if these players are found we start a new game with them
var try2LaunchGame = function(){
  //console.log('try2LaunchGame'); 
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
          
          //we choose randomely who play first ( Rem: 1 will always play first ) 
          players[player1.sid].turnId = 1 + Math.floor(2*Math.random());// equal 1 or 2 (randomely)
          players[player2.sid].turnId = 3 - players[player1.sid].turnId;// equal 1 or 2 depending on players[player1.sid].turnId value
          
          //we tell the 2 players (only them) that the game is starting 
          var socket;
          
          socket = clients[player1.sid];
          socket.emit('startGame', player1, player2);
          socket = clients[player2.sid];
          socket.emit('startGame', player2, player1);
          // console.log('player1.sid='+player1.sid);
          // console.log('player2.sid='+player2.sid);
          break;
        }
      }
    }
  }   
}


//If a user has an opponent we delete this link on players object 
//and tell that this opponent is available for a new game
var removeOpponentsLink = function(sid){
  if ( typeof players[sid] != "undefined" ){
    //if socket.id was playing we declare his opponent available so that he could be pick up by the server to play again
    //if his opponeent is define we remove sid as an opponent
    var op_sid = players[sid].opponent_sid;
    if ( op_sid ){
      if ( typeof players[op_sid] != "undefined" ){
        players[op_sid].dispo = true;
        players[op_sid].opponent_sid = null;
      }
    }
  }  
};

//Called when a user is deconnected from the server (page closed or page refresh: the sockets link will be lost) 
var deletePlayer = function(sid){
  removeOpponentsLink(sid);
  if ( typeof players[sid] != "undefined" ){
    delete players[sid];
  }
  if ( typeof clients[sid] != "undefined" ){
    delete clients[sid];
  }
};

//Called when a user come back to 'AI game mode' (the sockets link with the server is not destroyed) 
var inactivatePlayer = function(sid){
  removeOpponentsLink(sid);
  if ( typeof players[sid] != "undefined" ){
    players[sid].dispo = false;
    players[sid].pseudo = null;
  }  
};

var clients = {};//in this array  we will store the socket objects of clients

io.on('connection', function (socket){
  console.log('New client connected!');
  //_socket =  socket;//_socket will be is available inside routes if needed

  clients[socket.id] = socket;

  players[socket.id] = { 
    sid:socket.id,
    pseudo:null,
    dispo:false,//true if the user is available for a new multiplayer game
    turnId: null,//the user turn id, can be 1 or 2 (or null before and after the game) 
    opponent_sid:null,//socket.id of the opponent
    img:'human.png'//avatar
  };
  
  socket.emit('players',players);

  socket.on('getPlayers', function(){ 
    //console.log('players');
    socket.emit('players',players);//envoie juste au client connecté
  });

  socket.on('addPlayer', function (pseudo) {
    //console.log('addPlayer '+pseudo);
    players[socket.id].pseudo = pseudo;
    players[socket.id].dispo = true;
    //console.log('players list=',players);
    //socket.handshake.session.pseudo = pseudo;
    //io.sockets.emit('players', players);//send to all clients when a new client arrive
    try2LaunchGame();
  });
  
  socket.on('disconnect', function(){ 
    //console.log('disconnect');
    var osid = players[socket.id].opponent_sid;
    //prevenir players[socket.id].opponent_sid que socket.id quitte la partie
    if ( osid ){
      clients[osid].emit('opponentResign');
    }
    deletePlayer(socket.id);
    //prevenir adversaire !
    //io.sockets.emit('players', players);//send to all clients
  });

  //if a user leave the game we remove him from users list and we inform other clients
  socket.on('leaveGame', function(){
    //console.log('leaveGame');
    var osid = players[socket.id].opponent_sid;
    //prevenir players[socket.id].opponent_sid que socket.id quitte la partie
    if ( osid ){
      clients[osid].emit('opponentResign');
    }
    inactivatePlayer(socket.id);
  });  

  //if a user leave the game we remove him from users list and we inform other clients
  socket.on('gameEnd', function(){
    //console.log('gameEnd');
    inactivatePlayer(socket.id);
  });  

  socket.on('addDisc', function(col){
    //console.log('addDisc on col '+ col);
    //socket.id add a disc
    var osid = players[socket.id].opponent_sid;
    //prevenir players[socket.id].opponent_sid que socket.id quitte la partie
    if ( osid ){
      clients[osid].emit('addDisc',col);
    } 
  });  

  socket.on('sendMessage', function(msg){
    var osid = players[socket.id].opponent_sid;
    //if defined we send the message to the opponent of socket.id
    if ( osid ){//&& msg.trim().length > 0
      //console.log('newMessage:',msg);
      clients[osid].emit('newMessage',msg);
    } 
  });  

});

server.listen(port, function(){
    var addressHost = server.address().address;
    console.log('L\'application est disponible à l\'adresse http://%s:%s', addressHost, port);
});

// var getIdFromPseudo = function(pseudo, players){
//   for ( var prop in players) {
//     //console.log("x=",players[prop].pseudo);
//     if( players[prop].pseudo === pseudo){
//       return players[prop].sid;//return prop would also work
//     }
//   }
//   return null;
// };

// app.post('/connect4/comments', function(req, res) {
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