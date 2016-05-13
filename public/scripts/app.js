var MenuBar = React.createClass({
  render: function() {
    return (
      <ul id="menuBar">
        <li>Menu</li>
        <li>Inscription</li>
        <li>Connexion</li>
      </ul>
    );
  }
});

var GameZone = React.createClass({
  render: function() {
    return (
      <div id="gameZone">
        <SettingZone game={this.props.game} onUserclickLevel={this.props.onUserclickLevel} />
        <Mask game={this.props.game} onUserClick={this.props.onUserclick} />
        <Grid game={this.props.game} />
      </div>
    );
  }
});

var SettingZone = React.createClass({
  handleChange: function(event) {
    //alert(event.currentTarget.value);
    this.props.onUserclickLevel(event.currentTarget.value);
  },   
  render: function() {
    var style = {};
    var levelRows = [];
    for (var level in connec4Fct.getRankToPLayFromLevelAndNbrChoices) {
       levelRows.push( 
        <div key={level} >
          <input type="radio" value={level} checked={this.props.game.level === level } name="level"  onChange={this.handleChange}/> {level}
        </div>
      );   
    }
    //style.display = 'none';
    return (
      <div id="settingZone">
        <h1 style={style}>Setting</h1>
        <p>Current level: <b>{this.props.game.level}</b></p>
        <form action="" >
          <div className="block">
            {levelRows}
          </div>
        </form>
        <button type="button" onClick={this.play}>Play</button> 
        <p>winner: {this.props.game.winner}</p>
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
          classNames={this.props.game.classNames}  />      
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
      <div id="next-turn">Next turn: 
        <div className={classNames[turn]}></div>{turn === 1 ? <span className="wait">Please wait...</span> : null}
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
              alert("draw 0-0 !");
            }
            
            this.state.game.turn = 1;
            //get actual connect 4 game position in string notation       
            var pos = connec4Fct.arrayToString(this.state.game.position);
            //console.log("pos=",pos);

            //get the solution with Pascal Pons "alpha beta pruning" algorithm 
            connec4Fct.computerMove(this);
          }            
          break;
        case 1:
          alert("It's not your turn...");
          break;
        case 0:
          var rep = confirm("Play again ?");
          if (rep){
            var self = this;
            //Rem: setState work asynchronously we need to use a callback:
            this.setState({ game : new connec4Fct.game(this.state.game.level) }, function(){
              console.log("turn:",self.state.game.turn);
              if ( self.state.game.turn === 1 ){//faire jouer la machine    
                connec4Fct.computerMove(self);
              }else{
                //no code here because this.handleUserClick() will be call on the click event
              }
            });
          }
          break;
        default:
          alert("pb");
    } 
  },

  handleUserChangeLevel: function(value) {
    //alert(value);
    this.state.game.level = value;
    this.forceUpdate();
    //this.setState({ game : game });
  },

  render: function() {
    return (
      <div>
        <MenuBar/>
        <GameZone game={this.state.game} onUserclick={this.handleUserClick} onUserclickLevel={this.handleUserChangeLevel}/>
      </div>
    );
  }
});

ReactDOM.render(
  <Connect4 />,
  document.getElementById('container')
);

// var array = [2,2,3,15,6,100,100];

// console.log('array:',array);
// var n = array.length;

// var stat = {};

// for(var i=0;i<n;i++){
//   if ( array[i] != 100 ){//full column 
//     if ( !stat[array[i]] ){
//       stat[array[i]] = {occurrence: 1, positions:[i], value:array[i]};
//     }else{
//       stat[array[i]].occurrence++;
//       stat[array[i]].positions.push(i);
//     }
//   }
// }

// console.log('stat:',stat);
// var statSorted =_.sortBy(stat, 'value').reverse();
// console.log('statSorted:',statSorted);