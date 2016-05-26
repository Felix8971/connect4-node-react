
//var React = require('react');
//var Connect4Fct = require("./connect4Fct.js");

var About = require('./about.js');
var Contact = require('./contact.js');
var Connect4Fct = require('./connect4Fct.js');


var MenuBar = React.createClass({

    getInitialState: function(){
      var index=0;
      //if the user refresh the page we stay on the last page and we keep menu selection
      this.props.items.map(function(m){
        window.location.hash.indexOf(m.url) >= 0 ? index = m.index : null;
      });
      return { focused: index  };
    },

    clicked: function(index){
      // The click handler will update the state with the index of the focused menu entry
      this.setState({focused: index});
    },

    clicked2: function(event){
      // The click handler will update the state with the index of the focused menu entry
      // currentTarget always refers to the element the event handler has been attached to as opposed to event.target which identifies the element on which the event occurred.
      this.setState({focused: event.currentTarget.id});
    },

    render: function() {
      // We read the items array which was passed as an attribute when the component was created  
      // The map method loop over the array items and return a new array with <a> elements.
      var self = this;
      return (
        <div>
            <div id="menuBar">
              { this.props.items.map(function(m){
                  var style = self.state.focused == m.index ? 'focused' : '';
                  return (
                    <Link id={m.index} to={m.url} key={m.index} className={style} onClick={self.clicked2}>
                      {m.name}
                    </Link>
                  );
                }) 
              }
            </div>
        </div>
      );
    }
});

var SettingZone = React.createClass({

  getInitialState: function() {
    return {windowWidth: window.innerWidth};
  },

  handleResize: function(e) {
    this.setState({windowWidth: window.innerWidth});
    console.log("windowWidth=",this.state.windowWidth);
    console.log("maskHeight=",document.getElementById('mask').Width);
  },

  componentDidMount: function() {
    window.addEventListener('resize', this.handleResize);
  },

  componentWillUnmount: function() {
    window.removeEventListener('resize', this.handleResize);
  },

  // render: function() {
  //   var style = {visibility:'hidden'};
  //   return <div style={style}>Current window width: {this.state.windowWidth}</div>;
  // }

  handleClick: function(event) {
    console.log(event.currentTarget.id);
    this.props.onClickDifficulty(event.currentTarget.id);
  },    
  render: function() {
    //console.log("opponentType=",this.props.game.opponentType);
    switch(this.props.game.opponentType) {
        case 'robot':       
         
          var levelRows = [];
          for (var level in Connect4Fct.getRankToPLayFromLevelAndNbrChoices) {
             var img = "images/" + Connect4Fct.imageFromLevel[level];
             var className = this.props.game.level === level ? 'level-block selected' : 'level-block';
             levelRows.push( 
              <div key={level} className={className} id={level} onClick={this.handleClick}>
                <div className="robotFrame">
                  <img className="level-img" src={img}/>
                </div>
                <div className="info">{level}</div>
              </div>
            );   
          }
         
          return (
            <div id="settingZone">
              <ChooseMode opponentType={this.props.game.opponentType}  onClickOpponentType={this.props.onClickOpponentType}/>
              <br/>
              <div className="robots-list">
                <div className="title">Choose difficulty</div>
                <form action="" >
                  <div className="block">
                    {levelRows}
                  </div>
                </form>
              </div>
            </div>
          );            
          break;

        case 'human':

          var opponent = this.props.game.opponent;
          var players = this.props.game.players;
          var playerRows = [];
          console.log('players.length='+players.length);

          players.forEach(function(player){
             var className = opponent === player.name ? 'player-block selected' : 'player-block';
             console.log(player);
             playerRows.push( 
              <div key={player.id} className={className} id={player.id} >
                <div className="robotFrame">
                  <img className="player-img" src={"images/" + player.img}/>
                </div>
                <div className="info">{player.name}</div>
              </div>
            ); 
          }); 
          //var style= {height: 100 + 'px'};
          return (
            <div id="settingZone">
              <ChooseMode opponentType={this.props.game.opponentType} onClickOpponentType={this.props.onClickOpponentType}/>
              <br/>
              <div className="players-list" >
                {players.length > 0 ? playerRows : <div id="nobody">Nobody here...</div>}
              </div>
            </div>
          );          
          break;

        default:
          alert("error");
    } 
  }
});
 

var ChooseMode = React.createClass({
  handleChange: function(event) {
    console.log(event.currentTarget.id);
    this.props.onClickOpponentType(event.currentTarget.id);
  },    
  render: function() {
    return (
      <div id="container-chooseMode"> 
        <div className="title">Play with</div>
        <table className="chooseMode">
          <tbody>
            <tr>
              <td>
                <input checked={this.props.opponentType==='robot'} onChange={this.handleChange} name="radiog_dark" id="robot" className="css-checkbox"  type="radio"/>
                <label htmlFor="robot" className="css-label radGroup2">Robot</label>
              </td>
              <td>
                <input checked={this.props.opponentType==='human'} onChange={this.handleChange} name="radiog_dark" id="human" className="css-checkbox" type="radio"/>
                <label htmlFor="human" className="css-label radGroup2">Human</label>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }
  
});
 

var Mask = React.createClass({

  handleClick: function(event) {
    var col = parseInt(event.currentTarget.id.split('-')[2]);
    this.props.onUserClick(col);
  }, 

  playAgain: function(event) {
    this.props.onUserClick();
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
    var turn = this.props.game.turn;
    return (
      <div id="mask">
        
        {turn === 0 ?  <div id="playAgain" onClick={that.playAgain}>Click to play again</div>  : null }
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
        var pos = Connect4Fct.arrayToString(self.state.game.position);
        Connect4Fct.computerMove(self);
      }
    },2000);
  },  

  getInitialState: function() {
    //var firstPlayer = 1 + Math.floor(2*Math.random());// 1 or 2 random   
    return {
      game: new Connect4Fct.game()
    };
  },

  handleUserClick: function(col) {
    switch(this.state.game.turn) {
        case 2://if user is allowed to play 
          //the user plays
          var lastMove = Connect4Fct.addDisc(this.state.game, col);
          if ( !lastMove ){ 
            alert("This column is full!");
            return;
          }; 
          //console.log('lastMove=',lastMove); //console.log('game=',game); 
          this.state.game.nbMove++;
          this.forceUpdate();

          //it is a winning move ?
          var win = Connect4Fct.testWin(this.state.game, lastMove);
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
              this.forceUpdate();  
            }else{
              this.state.game.turn = 1;
              //get actual connect 4 game position in string notation       
              var pos = Connect4Fct.arrayToString(this.state.game.position);
              //console.log("pos=",pos);

              //get the solution from Pascal Pons "alpha beta pruning" algorithm 
              Connect4Fct.computerMove(this);
            }
          }            
          break;
        case 1:
          alert("It's not your turn...");
          break;
        case 0:
          //var rep = confirm("Play again ?");
          //if (rep){
            var self = this;
            //Rem: setState works asynchronously so we need to use a callback:
            this.setState({ game : new Connect4Fct.game(this.state.game.level) }, function(){
              console.log("turn:",self.state.game.turn);
              if ( self.state.game.turn === 1 ){//faire jouer la machine    
                Connect4Fct.computerMove(self);
              }else{
                //no code here because this.handleUserClick() will be called on the click event
              }
            });
          //}
          break;
        default:
          alert("an error");
    } 
  },

  handleChangeDifficulty: function(value){
    //alert(value);
    this.state.game.level = value;
    this.forceUpdate();
    //this.setState({ game : game });
  },

  handleChangeOpponentType: function(value){
    this.state.game.opponentType = value;
    this.forceUpdate();
  },


  render: function() {

    return (
      <div id="container">
        <div className="content game" >
           
            <SettingZone 
              game={this.state.game} 
              onClickDifficulty={this.handleChangeDifficulty}
              onClickOpponentType={this.handleChangeOpponentType}  /> 
            <Mask game={this.state.game} onUserClick={this.handleUserClick} />
            <Grid game={this.state.game} />
        </div>
      </div>
    );
  }
});


//<GameZone game={this.state.game} onUserclick={this.handleUserClick} onClickDifficulty={this.handleChangeDifficulty}/>

// ReactDOM.render(
//   <Connect4 />,
//   document.getElementById('container')
// );

//routing: see this excellent tutorial https://www.kirupa.com/react/creating_single_page_app_react_using_react_router.htm 

//What gets displayed inside App is controlled by the result of this.props.children instead of a hard-coded component.
var App = React.createClass({
  render: function() {
    var items = [
      {index:0, name:'PLAY',url:'/'},
      {index:1, name:'ABOUT',url:'/about'},
      {index:2, name:'CONTACT',url:'/contact'}
    ];

    return (
      <div>
       
        <h1 className="mainTitle">Connect 4</h1>
        <MenuBar items={items} />
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






// var UserGist = React.createClass({
//   getInitialState: function() {
//     return {
//       username: '',
//       lastGistUrl: ''
//     };
//   },

//   componentDidMount: function() {
//     this.serverRequest = $.get(this.props.source, function (result) {
//       var lastGist = result[0];
//       this.setState({
//         username: lastGist.owner.login,
//         lastGistUrl: lastGist.html_url
//       });
//     }.bind(this));
//   },

//   componentWillUnmount: function() {
//     this.serverRequest.abort();
//   },

//   render: function() {
//     return (
//       <div>
//         {this.state.username} s last gist is
//         <a href={this.state.lastGistUrl}>here</a>.
//       </div>
//     );
//   }
// });

// <UserGist source="https://api.github.com/users/octocat/gists" />