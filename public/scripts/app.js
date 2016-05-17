var MenuBar = React.createClass({
  render: function() {
    return (
      <div id="menuBar">
        <h1>Connect 4</h1>
        <a href="url" className="link">ABOUT</a>
        <a href="url" className="link">CREDITS</a>
      </div>
    );
  }
});

var GameZone = React.createClass({
  render: function() {
    return (
      <div id="gameZone">
          <MenuBar/>
          <SettingZone game={this.props.game} onClickDifficulty={this.props.onClickDifficulty} /> 

          <Mask game={this.props.game} onUserClick={this.props.onUserclick} />
          <Grid game={this.props.game} />
      </div>
    );
  }
});

var SettingZone = React.createClass({
  // handleChange: function(event) {
  //   alert(event.currentTarget.value);
  //   this.props.onClickDifficulty(event.currentTarget.value);
  // },  
  //<input className="input-level" type="radio" value={level} checked={this.props.game.level === level } name="level" onChange={this.handleChange}/>
  handleClick: function(event) {
    console.log(event.currentTarget.id);
    this.props.onClickDifficulty(event.currentTarget.id);

    //retirer classe selected à tous les level-block
    //attribuer class selected à event.currentTarget
    //event.currentTarget.className += "selected";
    //document.getElementsByClassName("level-block").classList.remove('selected');
    //document.getElementById(event.currentTarget.id).className += " selected";
  },    
  render: function() {
    var style = {};
    var levelRows = [];
    for (var level in connec4Fct.getRankToPLayFromLevelAndNbrChoices) {
       var img = "images/" + connec4Fct.imageFromLevel[level];
       var className = this.props.game.level === level ? 'level-block selected' :   'level-block';
       levelRows.push( 
        <div key={level} className={className} id={level} onClick={this.handleClick}>
          <div className="robotFrame">
            <img className="level-img" src={img}/>
          </div>
          <div className="info">{level}</div>
        </div>
      );   
    }
    //style.display = 'none';
    return (
      <div id="settingZone">
        <div className="title">Choose difficulty</div>
        <form action="" >
          <div className="block">
            {levelRows}
          </div>
        </form>
      </div>
    );
  }
});
 

var Mask = React.createClass({

  handleClick: function(event) {
    //console.log(event.currentTarget.id);
    var col = parseInt(event.currentTarget.id.split('-')[2]);
    this.props.onUserClick(col);
  },  
  render: function() {
    var that = this;
    var col=-1;
    var columns = this.props.game.grid.map(function(column) {      
      col++;
      var id = "mask-col-"+col;
      //console.log('col=',col);console.log('column=',column);
      return (
        <div className="column" key={id} id={id} onClick={that.handleClick}>
          <ColumnMask column={column} col={col}/>
        </div>
      );
    });

    return (
      <div id="mask">
        {columns}
        <NextTurnDisplay 
          turn={this.props.game.turn} 
          level={this.props.game.level} 
          winner={this.props.game.winner}
          classNames={this.props.game.classNames} />      
      </div>
    );    
    
  }
});

var ColumnMask = React.createClass({
  render: function() {
    var line = 6;
    var col = this.props.col;
    var squares = this.props.column.map(function(square) {
      line--;
      //var id = col.toString()+"-"+line.toString();
      var key = "mask-"+col+'-'+line;
      return (
        <div className="square" key={key} >
          <div className="boardImg"></div>
        </div>
      );
    });

    return (
      <div>{squares}</div>
    );
  }
});

var NextTurnDisplay = React.createClass({
  render: function() {
    var classNames = ["smallNoDisc","smallRedDisc","smallBlueDisc"];
    var turn = this.props.turn;
    return (
      <div>
        <div id="next-turn">Next turn: 
          {turn === 1 ? <img src="images/ajax-loader.gif" className="wait" alt="Please wait..."/> : <div className={classNames[turn]}></div>}
        </div>
        <div id="difficulty">Difficulty: {this.props.level}</div>
        <div id="winner">Winner: 
          <div className={classNames[this.props.winner]}></div>
        </div>
      </div>      
    );
  }
});


var Grid = React.createClass({
  render: function() {
    var col=-1;
    var classNames = this.props.game.classNames;
    var aligned = this.props.game.aligned;

    var columns = this.props.game.grid.map(function(column) {      
      col++;
      var id = "grid-col-"+col;
      //console.log('col=',col);console.log('column=',column);
      return (
        <div className="column" key={col} id={id}>
          <ColumnGrid column={column} classNames={classNames} col={col} aligned={aligned} />
        </div>
      );
    });

    return (
      <div id="grid">
          {columns}
      </div>
    );
  }
});

var ColumnGrid = React.createClass({
  render: function() {
    //var line = 6;
    var line = -1;
    var col = this.props.col;
    var classNames = this.props.classNames;
    var aligned = this.props.aligned;

    var squares = this.props.column.map(function(square) {
      //line--;
      line++
      var id = col.toString()+"-"+line.toString();
      var idSquare = "square-"+id;
      var idDisc = "disc-"+id;

      return (
        <div className="square" key={idDisc} id={idSquare} >
          <div  id={idDisc} className={classNames[square]}></div>
          { aligned[col][line] ? <img className="cross" src="../../images/forbidden-mark.svg"/> : null }
        </div>
      );
    });

    return (
      <div>{squares}</div>
    );
  }
});


var Connect4 = React.createClass({
  //componentDidMount is a method called automatically by React after a component is rendered for the first time. 
  componentDidMount: function() {
    // $(".square").each( function(index){
    //   var color = '#'+Math.floor(Math.random()*16777215).toString(16);
    //   $(this).css("background-color",color); 
    // });
    var self = this;
    setTimeout(function(){
      
      if ( self.state.game.turn === 1 ){//faire jouer la machine    
        //get actual connect 4 game position in string notation       
        var pos = connec4Fct.arrayToString(self.state.game.position);
        connec4Fct.computerMove(self);
      }
    },2000);
  },  

  getInitialState: function() {
    //var firstPlayer = 1 + Math.floor(2*Math.random());// 1 or 2 random   
    return {
      game: new connec4Fct.game()
    };
  },

  handleUserClick: function(col) {
    switch(this.state.game.turn) {
        case 2://if user is allowed to play 
          //the user plays
          var lastMove = connec4Fct.addDisc(this.state.game, col);
          if ( !lastMove ){ 
            alert("This column is full!");
            return;
          }; 
          //console.log('lastMove=',lastMove); //console.log('game=',game); 
          this.state.game.nbMove++;
          this.forceUpdate();

          //it is a winning move ?
          var win = connec4Fct.testWin(this.state.game, lastMove);
          if ( win ){
            this.state.game.winner = 2;
            this.state.game.turn = 0;
            this.forceUpdate();     
            //this.setState({ game : game });
            alert("You win!");
          }else{//IA'S turn to play

            //if no winner and grid full then draw game 
            if ( this.state.game.nbMove == 42 ){
              this.state.game.turn = 0;
              alert("draw 0-0 !");
            }else{
              this.state.game.turn = 1;
              //get actual connect 4 game position in string notation       
              var pos = connec4Fct.arrayToString(this.state.game.position);
              //console.log("pos=",pos);

              //get the solution from Pascal Pons "alpha beta pruning" algorithm 
              connec4Fct.computerMove(this);
            }
          }            
          break;
        case 1:
          alert("It's not your turn...");
          break;
        case 0:
          var rep = confirm("Play again ?");
          if (rep){
            var self = this;
            //Rem: setState works asynchronously so we need to use a callback:
            this.setState({ game : new connec4Fct.game(this.state.game.level) }, function(){
              console.log("turn:",self.state.game.turn);
              if ( self.state.game.turn === 1 ){//faire jouer la machine    
                connec4Fct.computerMove(self);
              }else{
                //no code here because this.handleUserClick() will be called on the click event
              }
            });
          }
          break;
        default:
          alert("an error");
    } 
  },

  handleChangeDifficulty: function(value) {
    //alert(value);
    this.state.game.level = value;
    this.forceUpdate();
    //this.setState({ game : game });
  },

  render: function() {
    return (
      <div id="container">
        <GameZone game={this.state.game} onUserclick={this.handleUserClick} onClickDifficulty={this.handleChangeDifficulty}/>
      </div>
    );
  }
});

ReactDOM.render(
  <Connect4 />,
  document.getElementById('container')
);

