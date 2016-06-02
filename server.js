var fs = require('fs');
var path = require('path');
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var server = require('http').Server(app);

// initializing express-session middleware
var Session = require('express-session');
var SessionStore = require('session-file-store')(Session);
var session = Session({store: new SessionStore({path: __dirname+'/sessions'}), secret: 'pass', resave: true, saveUninitialized: true});



var COMMENTS_FILE = path.join(__dirname, 'comments.json');

app.set('port', (process.env.PORT || 3000));

app.use('/', express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(session);

// voir https://github.com/xpepermint/socket.io-express-session/tree/master/example
var ios = require('socket.io-express-session');
var io = require('socket.io')(server);
io.use(ios(session)); // session support

// Additional middleware which will set headers that we need on each request.
app.use(function(req, res, next) {
    // Set permissive CORS header - this allows this server to be used only as
    // an API server in conjunction with something like webpack-dev-server.
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Disable caching so we'll always get the latest comments.
    res.setHeader('Cache-Control', 'no-cache');
    next();
});

// app.get('/api/comments', function(req, res) {
//   fs.readFile(COMMENTS_FILE, function(err, data) {
//     if (err) {
//       console.error(err);
//       process.exit(1);
//     }
//     res.json(JSON.parse(data));
//   });
// });

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

var server = app.listen(app.get('port'), function() {
  console.log('Server started: http://localhost:' + app.get('port') + '/');
});


// Socket.IO part used for multiplayer game
var io = require('socket.io')(server);

var sendComments = function (socket) {
  fs.readFile('_comments.json', 'utf8', function(err, comments) {
    comments = JSON.parse(comments);
    socket.emit('comments', comments);
  });
};

io.on('connection', function (socket) {
  console.log('New client connected!');
  
  socket.on('fetchComments', function () {
    sendComments(socket);
  });

  socket.on('newComment', function (comment, callback) {
    fs.readFile('_comments.json', 'utf8', function(err, comments) {
      comments = JSON.parse(comments);
      comments.push(comment);
      fs.writeFile('_comments.json', JSON.stringify(comments, null, 4), function (err) {
        io.emit('comments', comments);
        callback(err);
      });
    });
  });
});

