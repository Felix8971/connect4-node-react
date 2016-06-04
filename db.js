//On cree une connexion permanente du serveur node à mongodb
var mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient;

//var objectId = new mongodb.ObjectID();
//console.log(objectId);

var state = {
  db: null
};

exports.connect = function (url, done) {
  if (state.db) {
    return done();
  }
  
  MongoClient.connect(url, function (err, db) {
    if (err) {
      return done(err);
    }
    state.db = db;
    done();
  });
};

exports.get = function(){
  return state.db;
};

exports.close = function (done) {
  if (state.db) {
    state.db.close(function(err,result){
      state.db = null;
      state.mode = null;
      if (err) {
        done(err);
      }
    });
  }
};