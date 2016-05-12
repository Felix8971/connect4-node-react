//Add new token on connect4's board
var connec4Fct = {
  
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
  

  /**
   * For each of the scores array we determine where it appears (positions) and how often
   * and then a decreasing sort is made on the score value
  **/
  getArrayStat: function(array){
    //var array = [2,2,3,15,6,100,100];
    console.log('array:',array);
    var n = array.length;

    var stat = {};

    for(var i=0;i<n;i++){
      if ( array[i] != 100 ){//full column 
        if ( !stat[array[i]] ){
          stat[array[i]] = {occurrence: 1, positions:[i], value:array[i]};
        }else{
          stat[array[i]].occurrence++;
          stat[array[i]].positions.push(i);
        }
      }
    }

    console.log('stat:',stat);
    var statSorted =_.sortBy(stat, 'value').reverse();
    console.log('statSorted:',statSorted);
    return statSorted;
  },

  /**
   *  Dans le tableau retourné parconnec4Fct.getArrayStat() cette fonction donne l'indice à choisir pour jouer   
   *  en fonction du niveau de jeu et du nombre de choix possibles
  **/  
  getRankToPLayFromLevelAndNbrChoices : {
    "very easy":[0,1,2,3,4,5,6],//nb choix 1 => 0, nb choix 2 => 1, nb choix 3 => 2, 
    "easy":     [0,0,1,2,3,4,5],
    "normal":   [0,0,0,1,2,3,4],        
    "hard":     [0,0,0,0,1,2,3],
    "very hard":[0,0,0,0,0,0,0],   
  },

  /**
    * get the solution from server with Pascal Pons "alpha beta pruning" algorithm (cf. game.url)
    * and make the computer play 
  **/
  computerMove: function(_this, game, pos){
    
    $.ajax({
      url: game.url,
      data:{pos:pos},
      dataType: 'json',
      cache: false,
      success: function(data) {
        console.log("data:",data);
        
        // data.score = score for each playable column: winning moves have a positive score and losing moves 
        // have a negative score. The absolute value of the score gives you the number of moves 
        // before the end of the game. Hence best moves have highest scores. 
        // score of 100 on a column means that the column is full. 
        var array = data.score;
      
        var stat = connec4Fct.getArrayStat(array);
        var n = stat.length;
        //alert(n);
        console.log('stat:',stat);
        var columnPlayed;

        console.log("easy and nb choice " + n + ": "+connec4Fct.getRankToPLayFromLevelAndNbrChoices["easy"][n-1]);
        //donne l'incide du tableau stat à choisir pour jouer à ce nivaau là
        var rank = connec4Fct.getRankToPLayFromLevelAndNbrChoices[game.level][n-1];

        //columnPlayed = connec4Fct.getRandomElementInArray(stat[n-1].positions);
        columnPlayed = connec4Fct.getRandomElementInArray(stat[rank].positions);
       
        var lastMove = connec4Fct.addToken(game, columnPlayed);

        //we update the game state
        _this.setState({ game : game });

        var win = connec4Fct.testWin(game, lastMove);

        if ( win ){//computer win
          game.winner = 1;
          game.turn = 0;     
          alert("You loose!");
        }else{//pass turn to user
          game.turn = 2;
          //this.state.game.turn = 2;             
        }
        _this.setState({ game : game }); 

      }.bind(_this),
      error: function(xhr, status, err) {
        console.error(_this.props.url, status, err.toString());
      }.bind(_this)
    });

  },

  /**
   * Try to add token on the game's board  
   * if it's possible we update the games matrix, the position and the turn
  **/  
  addToken: function(game, col){
    var canAddToken = false;
    //we go from bottom to top of connect4's board searching for a free cell (with column=col)
    for(var line=5;line>=0;line--){
      if ( game.matrix[col][line] === 0 && line >= 0){
        canAddToken = true;
        game.matrix[col][line] = game.turn;
        game.position.push(col+1);//+1 because first column start by 1 in string notation and not 0            
        return {col:col,line:line, turn:game.turn};
      }
    }
    if ( !canAddToken ){ 
      return false;
    }        
  },

   //Check if the last move win 
  testWin: function(game, lastMove){//if optionCheck is true we check the aligned token

    var test_alignment_EW = function(game, lastMove, optionCheck){
      var nbAlignedToken = 1;
      //horizontal right direction
      for(var k=1;k<=3;k++){
        if ( lastMove.col+k < 7 ){
          if ( game.matrix[lastMove.col+k][lastMove.line+0] === lastMove.turn){
            nbAlignedToken++;
            if ( optionCheck ){
              game.aligned[lastMove.col+k][lastMove.line+0] = true;
            }
          }else{
            break;
          }
        }
      }

      //horizontal left direction
      for(var k=1;k<=3;k++){
        if ( lastMove.col-k >= 0 ){
          if ( game.matrix[lastMove.col-k][lastMove.line+0] === lastMove.turn){
            nbAlignedToken++;
            if ( optionCheck ){
              game.aligned[lastMove.col-k][lastMove.line+0] = true;
            }            
          }else{
            break;
          }
        }
      }

      //count both direction
      if ( nbAlignedToken >= 4 ){//yes it can be > 4 !
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
      var nbAlignedToken = 1;
      //vertical down
      for(var k=1;k<=3;k++){
        if ( lastMove.line + k < 6 ){
          if ( game.matrix[lastMove.col+0][lastMove.line + k] === lastMove.turn){
            nbAlignedToken++;
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
      if ( nbAlignedToken >= 4 ){
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
      var nbAlignedToken = 1;
      //toward North/west 
      for(var k=1;k<=3;k++){
        if ( (lastMove.col - k >= 0) && (lastMove.line - k >= 0) ){
          if ( game.matrix[lastMove.col-k][lastMove.line - k] === lastMove.turn){
            nbAlignedToken++;
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
          if ( game.matrix[lastMove.col + k][lastMove.line + k] === lastMove.turn){
            nbAlignedToken++;
            if ( optionCheck ){
              game.aligned[lastMove.col + k][lastMove.line + k] = true;
            }              
          }else{
            break;
          }
        }
      } 

      //count 
      if ( nbAlignedToken >= 4 ){
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
      var nbAlignedToken = 1;
      //toward North/Est 
      for(var k=1;k<=3;k++){
        if ( (lastMove.col + k < 7 ) && (lastMove.line - k >= 0 ) ){
          if ( game.matrix[lastMove.col + k][lastMove.line - k] === lastMove.turn){
            nbAlignedToken++;
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
          if ( game.matrix[lastMove.col - k][lastMove.line + k] === lastMove.turn){
            nbAlignedToken++;
            if ( optionCheck ){
              game.aligned[lastMove.col - k][lastMove.line + k] = true;
            }             
          }else{
            break;
          }
        }
      }   

      //count 
      if ( nbAlignedToken >= 4 ){
        return true;
      }
    }
    if ( test_alignment_NE(game, lastMove, false) ){
      //Now we know we have an alignment we can recall the function again to display it 
      test_alignment_NE(game, lastMove, true);
      game.aligned[lastMove.col][lastMove.line] = true; 
      return true;
    }
  }

};