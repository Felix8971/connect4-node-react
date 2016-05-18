var MenuBar = React.createClass({
  render: function() {
    return (
      <ul id="menuBar">
        <h1>Connect 4</h1>
        <li className="link"><Link to="/">PLAY</Link></li>
        <li className="link"><Link to="/about">ABOUT</Link></li>
        <li className="link"><Link to="/contact">CONTACT</Link></li>
      </ul>
    );
  }
});

var GameZone = React.createClass({
  render: function() {
    return (
      <div className="content game" >
          <SettingZone game={this.props.game} onClickDifficulty={this.props.onClickDifficulty} /> 
          <Mask game={this.props.game} onUserClick={this.props.onUserclick} />
          <Grid game={this.props.game} />
      </div>
    );
  }
});


var About = React.createClass({
  render: function() {
      return (
        <div className="content about" >
          <h1 className="title">ABOUT</h1>

          <h2 className="sub-title">Purpose of this web site</h2>
          <div> This is a connect 4 responsive web site implemented with React and NodeJS. 
           I developed it in order to practice (and learn) ReactJS. 
          
          <h2 className="sub-title">Rules</h2>
          Connect four (also called Gravitrips in Soviet Union) is a two players strategy game. 
          Each player drops alternatively a chip of his colors. The first player to align four chips wins.
          
          <h2 className="sub-title">Extra features on this website</h2>
          You can play against an artificial intelligence with 5 differents difficulty levels.
          If you think that a level is too easy you can try the next level but note that in "hard" level it is impossible to win if you let the AI play first... 
          
          <h2 className="sub-title">AI algorithm.</h2>
          The AI part of this game used a cool version of the <a href="https://en.wikipedia.org/wiki/Alpha%E2%80%93beta_pruning" target="_blank">alpha beta pruning</a> algorithm developed 
          by <a href="https://www.linkedin.com/in/pascalpons" target="_blank"> Mr Pascal Pons</a> 
          
          <hr/>
          Have any suggestions or comments ? Email me on  <a href="mailto:felix8971@hotmail.com?Subject=Hello%20again" target="_top"> felix8971@hotmail.com</a>.
          
          </div>
        </div>
      );
    }
});

var Contact = React.createClass({
  render: function() {
      return (
        <div className="content about" >
          <h2 className="sub-title">CONTACT</h2>
          <p>
            My name is Félix DEBON, I am a Javascript web developer based in Paris.<br/> 
            You can see my works on my <a href="http://felixdebon.com/portfolio/" target="_blank" >portfolio</a>.<br/>
            <br/> 
            Have any suggestions or comments ? Email me on  <a href="mailto:felix8971@hotmail.com?Subject=Hello%20again" target="_top"> felix8971@hotmail.com</a><br/> 
          </p>
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
          { aligned[col][line] ? <img className="cross" src="images/forbidden-mark.svg"/> : null }
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

// ReactDOM.render(
//   <Connect4 />,
//   document.getElementById('container')
// );

//routing: see this excellent tutorial https://www.kirupa.com/react/creating_single_page_app_react_using_react_router.htm 

//What gets displayed inside App is controlled by the result of this.props.children instead of a hard-coded component.
var App = React.createClass({
  render: function() {
    return (
      <div>
        <MenuBar/>
        <div>
          {this.props.children}
        </div>
      </div>
    )
  }
});

//allow us to remove the ReactRouter prefix from our Router and Route component instances below
var { Router,
      Route,
      IndexRoute,
      IndexLink,
      Link } = ReactRouter;

//Our Route element inside ReactDOM.render contains an IndexRoute element whose sole purpose for existing is to declare 
//which component will be displayed when the app initially loads.
ReactDOM.render(
  //router component & routing configuration (i.e mapping between URLs and the views)
  <Router>
    <Route path="/" component={App}>
      <IndexRoute component={Connect4} />
      <Route path="about" component={About} />
      <Route path="contact" component={Contact} />            
    </Route>
  </Router>,
  document.getElementById('container')
);