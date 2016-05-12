
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
        <Tokens game={this.props.game} />
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
    //style.display = 'none';
    return (
      <div id="settingZone">
        <h1 style={style}>Setting</h1>
        <p>Current level: <b>{this.props.game.level}</b></p>
        <form action="" >
          <div className="block">
            <input type="radio" checked={this.props.game.level === "very easy"} name="level" value="very easy" onChange={this.handleChange} />
            very easy
          </div>
          <div className="block">
            <input type="radio" checked={this.props.game.level === "easy"} name="level" value="easy" onChange={this.handleChange}/>
            easy
          </div>
          <div className="block">
            <input type="radio" checked={this.props.game.level === "normal"} name="level" value="normal" onChange={this.handleChange}/>
            normal
          </div>
          <div className="block">
            <input type="radio" checked={this.props.game.level === "hard"} name="level" value="hard" onChange={this.handleChange}/>
            hard
          </div>
          <div className="block">
            <input type="radio" checked={this.props.game.level === "very hard"} name="level" value="very hard" onChange={this.handleChange}/>
            very hard
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
    console.log(event.currentTarget.id);
    var col = parseInt(event.currentTarget.id.split('-')[2]);
    this.props.onUserClick(col);
  },  
  render: function() {
    var that = this;
    var col=-1;
    var columns = this.props.game.matrix.map(function(column) {      
      col++;
      var id = "mask-col-"+col;
      //console.log('col=',col);console.log('column=',column);
      return (
        <div className="column" key={col} id={id} onClick={that.handleClick}>
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

var NextTurnDisplay = React.createClass({
  render: function() {
    var classNames = ["smallNoToken","smallRedToken","smallBlueToken"];
    var turn = this.props.turn;
    return (
      <div id="next-turn">Next turn: 
        <div className={classNames[turn]}></div>
      </div>
    );
  }
});

var ColumnMask = React.createClass({
  render: function() {
    var line=6;
    var col = this.props.col;
    var squares = this.props.column.map(function(square) {
      line--;
      //var id = col.toString()+"-"+line.toString();
      //var idMask = "mask-"+id;
      return (
        <div className="square" key={line} >
          <div className="boardImg"></div>
        </div>
      );
    });

    return (
      <div id={col}>{squares}</div>
    );
  }
});

var Tokens = React.createClass({
  render: function() {
    var col=-1;
    var classNames = this.props.game.classNames;
    var aligned = this.props.game.aligned;

    var columns = this.props.game.matrix.map(function(column) {      
      col++;
      var id = "token-col-"+col;
      //console.log('col=',col);console.log('column=',column);
      return (
        <div className="column" key={col} id={id}>
          <ColumnToken column={column} classNames={classNames} col={col} aligned={aligned} />
        </div>
      );
    });

    return (
      <div id="tokens">
          {columns}
      </div>
    );    
    
  }
});

var ColumnToken = React.createClass({
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
      var idToken = "token-"+id;
      return (
        <div className="square" key={line} id={idSquare} >
          <div  id={idToken} className={classNames[square]}></div>
          { aligned[col][line] ? <img className="cross" src="../../images/thumbs-up-hand-symbol.svg"/> : null }
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
      
      if ( self.state.game.turn === 1 ){
        //faire jouer la machine    
        //console.log("position=",game.position);
        //get actual connect 4 game position in string notation       
        var pos = connec4Fct.arrayToString(self.state.game.position);
        //console.log("pos=",pos);

        connec4Fct.computerMove(self, self.state.game, pos);
      }
    },2000);
  },  

  getInitialState: function() {
    var firstPlayer = 1 + Math.floor(2*Math.random());// 1 or 2 random
    //firstPlayer = 1;//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    console.log("firstPlayer:",firstPlayer);
   
    return {

      game: { 
        gameInProgress: false,
        url:"http://connect4.gamesolver.org/solve?",
        level:"easy",
        players:[
          { name:"IA", id:1 , className:"redToken"},
          { name:"Guest", id:2, className:"blueToken" }
        ],
        classNames: ["noToken","redToken","blueToken"],
        //firstPlayer: firstPlayer, 
        turn: firstPlayer,
        winner:null,
        position: [],//list of integer (give the column's numbers successively played by users, first column is 1)
        matrix:[
          [0, 0, 0, 0, 0, 0],//first column (board's top first)
          [0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0],
        ],
        aligned:[//tells where to display the check symbol when 4 token or more are aligned
          [0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0],
        ]        
      }
    };
  },

  handleUserClick: function(col) {

    if ( this.state.game.turn === 2 ){//if user is allowed to play 
     
      //var game = _.clone(this.state.game);

      //the user plays
      var lastMove = connec4Fct.addToken(this.state.game, col);

      if ( !lastMove ){ 
        alert("This column is full!");
        return;
      }; 

      console.log('lastMove=',lastMove); //console.log('game=',game); 
     
      //The move is valid so we update the game state
      //this.setState({ game : game });  
      this.forceUpdate();
      //it is a winning move ?
      var win = connec4Fct.testWin(this.state.game, lastMove);

      if ( win ){
        this.state.game.winner = 2;
        this.state.game.turn = 0;
        this.forceUpdate();     
        //this.setState({ game : game });
        alert("You win!");
      }else{
        //IA'S turn to play
        this.state.game.turn = 1;
      
        //console.log("position=",game.position);
        //get actual connect 4 game position in string notation       
        var pos = connec4Fct.arrayToString(this.state.game.position);
        //console.log("pos=",pos);

        //get the solution with Pascal Pons "alpha beta pruning" algorithm 
        connec4Fct.computerMove(this, this.state.game, pos);
        
      }
    }else{
        alert("It's not your turn...");
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
        <MenuBar />
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