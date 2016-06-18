
var _ = require("lodash");//underscore with more stuff

var C4Fct = {
  
  //urlConnect4MP : "http://localhost:8080", //"http://www.felixdebon.fr", //dev
  //urlConnect4MP : "http://www.felixdebon.fr", //prod

  arrayToString: function(array){
    var n = array.length;
    var s = "";
    for (var i=0;i<n;i++){
      s += array[i].toString();
    }
    return s;
  },

  // Returns a random integer between min (included) and max (included)
  getRandomIntInclusive : function(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },
    
  // Chose randomly an element in an array and return it 
  getRandomElementInArray : function (array){
    //var n = array.length;
    var index = this.getRandomIntInclusive(0,array.length-1);
    return array[index];
  },

  isPseudoUsed: function (pseudo, players){
    for ( var prop in players) {
      if( players[prop].pseudo === pseudo){
        return true;
      }
    }
    return false;
  },

  displayPlayers:  function (players){
    console.log("--- Players --- :");
    for ( var prop in players) {
      console.log(players[prop].pseudo);
    }
  },

  emptyGrid : function(){
    //can contain 3 differents value: 
    // 0 : for empty emplacement
    // 1 : for red disc
    // 2 : for blue disk
    return [//game map
      [0, 0, 0, 0, 0, 0],//first column (grid's top first)
      [0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0],
    ];    
  },

  game: function(level){
    this.pseudo = null;
    this.opponentPseudo = null;
    this.turn = 1 + Math.floor(2*Math.random());// 1 or 2 randomely (tells us who is going to play by his code, 1 always start)
    this.lastMove = {};
    this.opponentType = "robot"; //can be "robot" ou "human"
    this.level = level || "normal";
    this.nbMove = 0;
    this.winner = 0;
    this.players = {};      
    this.classNames = ["noDisc","redDisc","blueDisc"];
    this.urlSolver = "http://connect4.gamesolver.org/solve?";
    //this.urlConnect4MP = "http://connect4.gamesolver.org/solve?";
    this.me = {};
    this.opponent = {};
    this.position = [];//list of column's numbers successively played, first column is 1
    this.grid = C4Fct.emptyGrid();//game matrix map
    this.aligned = C4Fct.emptyGrid();//tells where to display the check symbol when 4 discs or more are aligned

    this.messages = [];//chat messages
    this.inputValue = '';
  },

  /**
   * For each value of the scores array we determine where it appears (positions) and how often
   * and then a decreasing sort is made on the score value
  **/
  getArrayStat: function(array){
    //var array = [2,2,3,15,6,100,100];
    //console.log('array:',array);
    var n = array.length;

    var stat = {};

    for(var i=0;i<n;i++){
      if ( array[i] != 100 ){//score of 100 on a column means that the column is full. 
        if ( !stat[array[i]] ){
          stat[array[i]] = {occurrence: 1, positions:[i], value:array[i]};
        }else{
          stat[array[i]].occurrence++;
          stat[array[i]].positions.push(i);
        }
      }
    }
    //console.log('stat:',stat);
    var statSorted =_.sortBy(stat, 'value').reverse();
    //console.log('statSorted:',statSorted);
    return statSorted;
  },

  /**
   *  Dans le tableau retourné par C4Fct.getArrayStat() cet objet donne l'indice à choisir pour jouer   
   *  en fonction du niveau de jeu et du nombre de choix possibles
  **/  
  // getRankToPLayFromLevelAndNbrChoices : {
  //   "easy":     [0,0,1,2,3,4,5],
  //   "normal":   [0,0,0,1,2,3,4],        
  //   "hard":     [0,0,0,0,1,2,3],
  //   "very hard":[0,0,0,0,0,0,0],   
  // },


  infoFromLevel : {
    "easy": { 
      img:"R2D2.png",
      speech:"01001000 01101001 00100001...",
      rankToPLayFromLevelAndNbrChoices:[0,0,1,2,3,4,5]
    },
    "normal":{
      img:"6PO.png",
      speech:"Your chances of survival are 3720 to 1...",
      rankToPLayFromLevelAndNbrChoices:[0,0,0,1,2,3,4]  
    } ,
    "hard":{ 
      img:"Terminator.png",
      speech:"Sarah Connor ?",
      rankToPLayFromLevelAndNbrChoices:[0,0,0,0,1,2,3]
    },
    "very hard":{ 
      img:"HAL9000.png", 
      speech:"Dave, this conversation can serve no purpose anymore. Goodbye.",//My mind is going... I can feel it
      rankToPLayFromLevelAndNbrChoices:[0,0,0,0,0,0,0]   
    },
  },

  /**
    * get the solution from Pascal Pons's server with  "alpha beta pruning" algorithm (cf. game.url)
    * and make the computer play 
  **/

  computerMove: function(that){
    var game = that.state.game;
    var pos = C4Fct.arrayToString(game.position);
    //var pos ="32";//console.log('pos=',pos);
    var options = {  
      method: 'GET' 
    };

//ReferenceError: Can't find variable: fetch iphone !!

    fetch(game.urlSolver+"pos="+pos, options).then(function(res) {
      return res.json();
    }).then(function(data){
      //console.log('data=',data);
      // data.score = score for each playable column: winning moves have a positive score and losing moves 
      // have a negative score. The absolute value of the score gives you the number of moves 
      // before the end of the game. Hence best moves have highest scores. 
      // score of 100 on a column means that the column is full. 
      var array = data.score;
    
      var stat = C4Fct.getArrayStat(array);
      var n = stat.length;
      //console.log('n:'+ n+ ' stat:',stat);
      var columnPlayed;
      //donne l'incide du tableau stat à choisir pour jouer à ce nivaau là
      var rank = C4Fct.infoFromLevel[game.level].rankToPLayFromLevelAndNbrChoices[n-1];

      //columnPlayed = C4Fct.getRandomElementInArray(stat[n-1].positions);
      columnPlayed = C4Fct.getRandomElementInArray(stat[rank].positions);
     
      that.state.game.turn = 1;

      var lastMove = C4Fct.addDisc(game, columnPlayed);
      that.state.game.lastMove = lastMove;
      that.state.game.lastMove.blink = true;
      game.nbMove++;
      
      //we update the game state
      that.forceUpdate();    
      //that.setState({ game : game });

      var win = C4Fct.testWin(game, lastMove);

      if ( win ){//computer win
        game.winner = 1;
        game.turn = null;     
        alert("You loose!");
      }else{//pass turn to user
        if ( that.state.game.nbMove === 42 ){
          alert("draw 0-0 !");
        }
        game.turn = 2;
        //that.state.game.turn = 2;             
      }
      //that.setState({ game : game }); 
      that.forceUpdate();          
    }.bind(that) )
    .catch(function(error) {
      console.log('There has been a problem with your fetch operation 4: ' + error.message);
    });

  },


  /**
   * Try to add a disc at a given column on the game's grid,  
   * if it's possible we update the game object
  **/  
  addDisc: function(game, col){
    var canAddDisc = false;
    //we go from bottom to top of connect4's board searching for a free cell (with column=col)
    for(var line=5;line>=0;line--){
      if ( game.grid[col][line] === 0 && line >= 0){
        canAddDisc = true;
        game.grid[col][line] = game.turn;
        game.position.push(col+1);//+1 because first column start by 1 in string notation, not 0.            
        return {col:col,line:line, turn:game.turn, blink:false};
      }
    }
    if ( !canAddDisc ){ 
      return false;
    }        
  },


  /**
   * Try to remove a disc at a given column from the game's grid,  
  **/  
  removeDisc: function(game, col){
    var canRemoveDisc = false;
    //we go from top to bottom of connect4's board searching for a disc (with column=col)
    for(var line=0;line<6;line++){
      if ( game.grid[col][line] > 0 ){
        canRemoveDisc = true;
        game.grid[col][line] = 0;
        game.position.pop();//Remove the last element of the array     
        return {col:col,line:line, turn:3-game.turn, blink:false};
      }
    }
    if ( !canRemoveDisc ){ 
      return false;
    }        
  },



  // test_generic : function(use1, a , b, use2, c, d, e, f, game, lastMove, optionCheck){
  //   for(var k=1;k<=3;k++){
  //     if ( (use1 || (lastMove.col + a*k >= b)) && (use2 || (lastMove.line + c*k >= d)) ){
  //       if ( game.grid[lastMove.col + e*k][lastMove.line + f*k] === lastMove.turn){
  //         nbAlignedDisc++;
  //         if ( optionCheck ){
  //           game.aligned[lastMove.col + e*k][lastMove.line + f*k] = true;
  //         }             
  //       }else{
  //         break;
  //       }
  //     }
  //   } 
  // },

  //Check if the last move win (i.e. at least four pieces connected)
  testWin: function(game, lastMove){//we will record the aligned discs in game.aligned matrix

    var count = function(nbAlignedDisc, game){
      //count both direction
      if ( nbAlignedDisc >= 4 ){//yes it can be > 4 !
        return true;
      }else{
        game.aligned = C4Fct.emptyGrid();
        return false;
      }
    }
    
    //use to verify if we have 4 chips horizontally aligned
    //if so the 'aligned' grid will be update 
    var test_alignment_EW = function(game, lastMove){
      var nbAlignedDisc = 1;
      game.aligned[lastMove.col][lastMove.line] = true;
      //Horizontal right direction 
      //C4Fct.test_generic(0,1,7,1,0,0,1,0,game, lastMove, optionCheck);
      for(var k=1;k<=3;k++){
        if ( lastMove.col+k < 7 ){
          if ( game.grid[lastMove.col+k][lastMove.line+0] === lastMove.turn){
            nbAlignedDisc++;
            game.aligned[lastMove.col+k][lastMove.line+0] = true;
          }else{
            break;
          }
        }
      }
      //console.log('nbAlignedDisc:'+nbAlignedDisc);
      //C4Fct.test_generic(0,-1,0,1,0,0,-1,0,game, lastMove, optionCheck);
      
      //Horizontal left direction
      for(var k=1;k<=3;k++){
        if ( lastMove.col-k >= 0 ){
          if ( game.grid[lastMove.col-k][lastMove.line+0] === lastMove.turn){
            nbAlignedDisc++;
            game.aligned[lastMove.col-k][lastMove.line+0] = true;           
          }else{
            break;
          }
        }
      }
      //console.log('nbAlignedDisc:'+nbAlignedDisc);
      //count in both direction
      return count(nbAlignedDisc, game);
    }

    var test_alignment_NS = function(game, lastMove){
      var nbAlignedDisc = 1;
      game.aligned[lastMove.col][lastMove.line] = true; 
      //vertical down
      for(var k=1;k<=3;k++){
        if ( lastMove.line + k < 6 ){
          if ( game.grid[lastMove.col+0][lastMove.line + k] === lastMove.turn){
            nbAlignedDisc++;
            game.aligned[lastMove.col+0][lastMove.line + k] = true;            
          }else{
            break;
          }
        }
      }        
      //vertical up doesn't need to be checked (it will always be empty due to gravity effect...)
      //count 
      return count(nbAlignedDisc, game);
    }

    var test_alignment_NW = function(game, lastMove){
      var nbAlignedDisc = 1;
      game.aligned[lastMove.col][lastMove.line] = true; 
      //toward North/west 
      for(var k=1;k<=3;k++){
        if ( (lastMove.col - k >= 0) && (lastMove.line - k >= 0) ){
          if ( game.grid[lastMove.col-k][lastMove.line - k] === lastMove.turn){
            nbAlignedDisc++;
            game.aligned[lastMove.col - k][lastMove.line- k] = true;       
          }else{
            break;
          }
        }
      } 
      //toward South/Est 
      for(var k=1;k<=3;k++){
        if ( (lastMove.col + k < 7 ) && (lastMove.line + k < 6 ) ){
          if ( game.grid[lastMove.col + k][lastMove.line + k] === lastMove.turn){
            nbAlignedDisc++;
            game.aligned[lastMove.col + k][lastMove.line + k] = true;     
          }else{
            break;
          }
        }
      } 
      //count 
      return count(nbAlignedDisc, game);
    }

    var test_alignment_NE = function(game, lastMove){    
      var nbAlignedDisc = 1;
      game.aligned[lastMove.col][lastMove.line] = true; 
      //toward North/Est 
      for(var k=1;k<=3;k++){
        if ( (lastMove.col + k < 7 ) && (lastMove.line - k >= 0 ) ){
          if ( game.grid[lastMove.col + k][lastMove.line - k] === lastMove.turn){
            nbAlignedDisc++;
            game.aligned[lastMove.col + k][lastMove.line - k] = true;            
          }else{
            break;
          }
        }
      }        
      //toward South/West 
      for(var k=1;k<=3;k++){
        if ( (lastMove.col - k >= 0 ) && (lastMove.line + k < 6 ) ){
          if ( game.grid[lastMove.col - k][lastMove.line + k] === lastMove.turn){
            nbAlignedDisc++;
            game.aligned[lastMove.col - k][lastMove.line + k] = true;     
          }else{
            break;
          }
        }
      }   
      //count 
      return count(nbAlignedDisc, game);
    }

    //we use the functions
    if ( test_alignment_EW(game, lastMove) ){
      return true;
    } else if ( test_alignment_NS(game, lastMove) ){
      return true;
    } else if ( test_alignment_NW(game, lastMove) ){
      return true;
    } else if ( test_alignment_NE(game, lastMove) ){
      return true;
    } else {
      return false;
    }

  },

  // getPlayers: function(that, callback){
  //   $.ajax({
  //     url: "http://www.felixdebon.fr/connect4/getplayers",
  //     //url: "/connect4/getplayers",
  //     dataType: 'json',
  //     cache: false,
  //     success: function(data) {
  //       callback(data); 
  //       console.log("data with jquery:",data);
  //     }.bind(that),
  //     error: function(xhr, status, err) {
  //       console.log('There has been a problem with your $.ajax operation 2: ' + err.message);
  //     }.bind(that)
  //   });
  // },

  getPlayers: function(that, callback){//doesn't work in production !(I replaced it by a websocket)
    var options = { method: 'GET' };
    fetch("www.felixdebon.fr/connect4/getplayers", options).then(function(res) {
      return res.json();
    })
    .then(function(data){
      //console.log("players recue=",data);
      callback(data);        
    }.bind(that) )
    .catch(function(error) {
      console.log('There has been a problem with your fetch operation 2: ' + error.message);
    }); 
  },

  //for asynchronous test with mocha
  test: function(callback){
    setTimeout(function(){
      callback();       
    },500); 
  },


};

module.exports = C4Fct;
