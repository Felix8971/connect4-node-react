//Add new disc on connect4's grid
var Connect4Fct = {
  
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
    var n = array.length;
    var index = this.getRandomIntInclusive(0,n-1);
    return array[index];
  },

  game: function(level){
        this.opponentType = "robot"; //can be "robot" ou "human" 
        this.opponent= "Felix8971";
        this.level = level || "normal";
        this.nbMove = 0;
        this.winner = 0;
        this.gameInProgress = false;
        this.turn = 1 + Math.floor(2*Math.random());// 1 or 2 random
        this.classNames = ["noDisc","redDisc","blueDisc"];
        this.url = "http://connect4.gamesolver.org/solve?";
        this.players = [
          // { name:"Toto125", id:1, img:"human.png" } ,
          // { name:"Felix8971", id:2 , img:"human.png" },
          // { name:"GrosMinet", id:3 , img:"human.png"  },
          // { name:"aaaaaa", id:4, img:"human.png" } ,
          // { name:"bbbbbbbbb", id:5 , img:"human.png" },
          // { name:"cccc", id:6 , img:"human.png"  },          
        ];

        this.position = [];//list of column's numbers successively played, first column is 1
        this.grid = [//game map
          [0, 0, 0, 0, 0, 0],//first column (grid's top first)
          [0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0],
        ];
        this.aligned = [//tells where to display the check symbol when 4 discs or more are aligned
          [0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0],
        ];
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
   *  Dans le tableau retourné parConnect4Fct.getArrayStat() cet objet donne l'indice à choisir pour jouer   
   *  en fonction du niveau de jeu et du nombre de choix possibles
  **/  
  getRankToPLayFromLevelAndNbrChoices : {
    "very easy":[0,1,2,3,4,5,6],//nb choix 1 => 0, nb choix 2 => 1, nb choix 3 => 2, 
    "easy":     [0,0,1,2,3,4,5],
    "normal":   [0,0,0,1,2,3,4],        
    "hard":     [0,0,0,0,1,2,3],
    "very hard":[0,0,0,0,0,0,0],   
  },


  imageFromLevel : {
    "very easy":"very_easy.png",//nb choix 1 => 0, nb choix 2 => 1, nb choix 3 => 2, 
    "easy":     "r2d2.png",
    "normal":   "6po.png",
    "hard":     "terminator.png",
    "very hard":"hal.png",
  },

  /**
    * get the solution from server with Pascal Pons "alpha beta pruning" algorithm (cf. game.url)
    * and make the computer play 
  **/
  computerMove: function(_this){
    var game = _this.state.game;
    var pos = Connect4Fct.arrayToString(game.position);

    $.ajax({
      url: game.url,
      data:{pos:pos},
      dataType: 'json',
      cache: false,
      success: function(data) {
        //console.log("data:",data);
        
        // data.score = score for each playable column: winning moves have a positive score and losing moves 
        // have a negative score. The absolute value of the score gives you the number of moves 
        // before the end of the game. Hence best moves have highest scores. 
        // score of 100 on a column means that the column is full. 
        var array = data.score;
      
        var stat = Connect4Fct.getArrayStat(array);
        var n = stat.length;
        //alert(n);
        //console.log('stat:',stat);
        var columnPlayed;

        //console.log("easy and nb choice " + n + ": "+Connect4Fct.getRankToPLayFromLevelAndNbrChoices["easy"][n-1]);
        //donne l'incide du tableau stat à choisir pour jouer à ce nivaau là
        var rank = Connect4Fct.getRankToPLayFromLevelAndNbrChoices[game.level][n-1];

        //columnPlayed = Connect4Fct.getRandomElementInArray(stat[n-1].positions);
        columnPlayed = Connect4Fct.getRandomElementInArray(stat[rank].positions);
       
        var lastMove = Connect4Fct.addDisc(game, columnPlayed);
        game.nbMove++;
        
        //we update the game state
        _this.forceUpdate();    
        //_this.setState({ game : game });

        var win = Connect4Fct.testWin(game, lastMove);


        if ( win ){//computer win
          game.winner = 1;
          game.turn = 0;     
          alert("You loose!");
        }else{//pass turn to user
          if ( this.state.game.nbMove == 42 ){
            alert("draw 0-0 !");
          }
          game.turn = 2;
          //this.state.game.turn = 2;             
        }
        //_this.setState({ game : game }); 
        _this.forceUpdate();    
      }.bind(_this),
      error: function(xhr, status, err) {
        console.error(_this.props.url, status, err.toString());
      }.bind(_this)
    });

  },

  /**
   * Try to add a disc on the game's grid  
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
        return {col:col,line:line, turn:game.turn};
      }
    }
    if ( !canAddDisc ){ 
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

  //Check if the last move win (four pieces connected)
  testWin: function(game, lastMove){//if optionCheck is true we record the aligned discs in game.aligned matrix
    
    var test_alignment_EW = function(game, lastMove, optionCheck){
      var nbAlignedDisc = 1;
      //horizontal right direction
      //Connect4Fct.test_generic(0,1,7,1,0,0,1,0,game, lastMove, optionCheck);
      for(var k=1;k<=3;k++){
        if ( lastMove.col+k < 7 ){
          if ( game.grid[lastMove.col+k][lastMove.line+0] === lastMove.turn){
            nbAlignedDisc++;
            if ( optionCheck ){
              game.aligned[lastMove.col+k][lastMove.line+0] = true;
            }
          }else{
            break;
          }
        }
      }
      //console.log('nbAlignedDisc:'+nbAlignedDisc);
      //Connect4Fct.test_generic(0,-1,0,1,0,0,-1,0,game, lastMove, optionCheck);
      
      //horizontal left direction
      for(var k=1;k<=3;k++){
        if ( lastMove.col-k >= 0 ){
          if ( game.grid[lastMove.col-k][lastMove.line+0] === lastMove.turn){
            nbAlignedDisc++;
            if ( optionCheck ){
              game.aligned[lastMove.col-k][lastMove.line+0] = true;
            }            
          }else{
            break;
          }
        }
      }
      //console.log('nbAlignedDisc:'+nbAlignedDisc);
      //count both direction
      if ( nbAlignedDisc >= 4 ){//yes it can be > 4 !
        return true;
      }
    }


    if ( test_alignment_EW(game, lastMove, false) ){
      //Now we know we have an alignment we can recall the function again to display it 
      test_alignment_EW(game, lastMove, true);
      game.aligned[lastMove.col][lastMove.line] = true; 
      return true;
    }

    var test_alignment_NS = function(game, lastMove, optionCheck){
      var nbAlignedDisc = 1;
      //vertical down
      for(var k=1;k<=3;k++){
        if ( lastMove.line + k < 6 ){
          if ( game.grid[lastMove.col+0][lastMove.line + k] === lastMove.turn){
            nbAlignedDisc++;
            if ( optionCheck ){
              game.aligned[lastMove.col+0][lastMove.line + k] = true;
            }             
          }else{
            break;
          }
        }
      }        
      //vertical up doesn't need to be checked (it will always be empty due to gravity effect)
      
      //count 
      if ( nbAlignedDisc >= 4 ){
        return true;
      }
    }

    if ( test_alignment_NS(game, lastMove, false) ){
      //Now we know we have an alignment we can recall the function again to display it 
      test_alignment_NS(game, lastMove, true);
      game.aligned[lastMove.col][lastMove.line] = true; 
      return true;
    }



    var test_alignment_NW = function(game, lastMove, optionCheck){
      var nbAlignedDisc = 1;
      //toward North/west 
      for(var k=1;k<=3;k++){
        if ( (lastMove.col - k >= 0) && (lastMove.line - k >= 0) ){
          if ( game.grid[lastMove.col-k][lastMove.line - k] === lastMove.turn){
            nbAlignedDisc++;
            if ( optionCheck ){
              game.aligned[lastMove.col - k][lastMove.line- k] = true;
            }             
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
            if ( optionCheck ){
              game.aligned[lastMove.col + k][lastMove.line + k] = true;
            }              
          }else{
            break;
          }
        }
      } 

      //count 
      if ( nbAlignedDisc >= 4 ){
        return true;
      }
    }

    if ( test_alignment_NW(game, lastMove, false) ){
      //Now we know we have an alignment we can recall the function again to display it 
      test_alignment_NW(game, lastMove, true);
      game.aligned[lastMove.col][lastMove.line] = true; 
      return true;
    }


    var test_alignment_NE = function(game, lastMove, optionCheck){    
      var nbAlignedDisc = 1;
      //toward North/Est 
      for(var k=1;k<=3;k++){
        if ( (lastMove.col + k < 7 ) && (lastMove.line - k >= 0 ) ){
          if ( game.grid[lastMove.col + k][lastMove.line - k] === lastMove.turn){
            nbAlignedDisc++;
            if ( optionCheck ){
              game.aligned[lastMove.col + k][lastMove.line - k] = true;
            }             
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
            if ( optionCheck ){
              game.aligned[lastMove.col - k][lastMove.line + k] = true;
            }             
          }else{
            break;
          }
        }
      }   

      //count 
      if ( nbAlignedDisc >= 4 ){
        return true;
      }
    }
    if ( test_alignment_NE(game, lastMove, false) ){
      //Now we know we have an alignment we can recall the function again to display it 
      test_alignment_NE(game, lastMove, true);
      game.aligned[lastMove.col][lastMove.line] = true; 
      return true;
    }
  },

};


module.exports = Connect4Fct;