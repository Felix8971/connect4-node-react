
//var React = require('react');

var socket = io();
var About = require('./about.js');
var Contact = require('./contact.js');
var C4Fct = require('./connect4Fct.js');
var debug = false;

var MenuBar = React.createClass({
    getInitialState: function(){
      var index=0;
      //if the user refresh the page we stay on the previous page and we keep menu selection's setting
      this.props.items.map(function(m){
        window.location.hash.indexOf(m.url) >= 0 ? index = m.index : null;
      });
      return { focused: index  };
    },

    clicked: function(event){
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
                    <Link id={m.index} to={m.url} key={m.index} className={style} onClick={self.clicked}>
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


var ChooseMode = React.createClass({
  handleChange: function(event) {
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
   
    var showMsg = false;

    if ( this.props.game.opponentType === 'robot' ){
      if ( this.props.game.turn === 1 ){
        showMsg = true;
      }
      var msg = "Your opponent is thinking. Please wait..."; 

    }else if ( this.props.game.opponentType === 'human' ){
      if ( this.props.game.turn != this.props.game.me.turnId ){
        showMsg = true;
      }
      if ( typeof this.props.game.opponent.sid != "undefined" ){
        var msg = "Your opponent is thinking. Please wait...";    
      }else{
        var msg = "Waiting for opponent...";  
      }
    }
    //if there is a winner we hide the message
    if ( this.props.game.winner ){
      showMsg = false;
    }

    return (
      //img id="loader" src="images/loading_apple.gif" alt="Please wait..."/>
      <div id="mask">
        
        { this.props.game.turn === null && this.props.game.opponentType === 'robot' ?  <div id="playAgain" onClick={that.playAgain}>Click to play again</div>  : null }
        { showMsg ? <div id="wait"  className='slowBlink'>{msg}</div> : null }

        {columns}
    
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

//{turn === 1 ? <img src="images/ajax-loader.gif" className="wait" alt="Please wait..."/> : <div className={classNames[turn]}></div>}
//{ this.props.opponentType === 'robot' ? <div id="difficulty">Difficulty: {this.props.level}</div> : null}
var NextTurnDisplay = React.createClass({
  
  render: function() {
    var classNames = ["smallNoDisc","smallRedDisc","smallBlueDisc"];
    var turn = this.props.game.turn;
    //console.log("opponentType=",this.props.game.opponentType);
   
    switch(this.props.game.opponentType) {
      case 'robot':   
        var myTurnId = 2;      
        var myPseudo = 'You';
        var opponentPseudo = C4Fct.infoFromLevel[this.props.game.level].img.split('.')[0];           
        break;
      case 'human':   
        var myTurnId = this.props.game.me.turnId;
        var myPseudo = this.props.game.pseudo; 
        var opponentPseudo = this.props.game.opponent.pseudo;
        break;
      default:
          alert("error");
    }     
    return (
      <div id="nextTurnDisplay">
        <div className="pseudos">
          <div id="me" >{myPseudo}
            <div className={classNames[myTurnId]}></div>
          </div>
          |
          <div id="opponent">{opponentPseudo} 
            <div className={classNames[3-myTurnId]}></div>
          </div>
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
    var lastMove = this.props.game.lastMove;

    var columns = this.props.game.grid.map(function(column) {      
      col++;
      var id = "grid-col-"+col;
      //console.log('col=',col);console.log('column=',column);
      return (
        <div className="column" key={col} id={id}>
          <ColumnGrid column={column} classNames={classNames} col={col} aligned={aligned} lastMove={lastMove}/>
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
    var line = -1;
    var col = this.props.col;
    var classNames = this.props.classNames;
    var aligned = this.props.aligned;
    var lastCol = this.props.lastMove.col;
    var lastLine = this.props.lastMove.line;
    var blink =  this.props.lastMove.blink;

    var squares = this.props.column.map(function(square) {
      line++
      var id = col.toString()+"-"+line.toString();
      var idSquare = "square-"+id;
      var idDisc = "disc-"+id;
      var style = 'square';

      if ( lastCol === col && lastLine ===  line && blink ){ 
        style += ' fastBlink';
      }

      return (
        <div className={style} key={idDisc} id={idSquare} >
          <div  id={idDisc} className={classNames[square]}  ></div>
          { aligned[col][line] ? <img className="cross" src="images/forbidden-mark.svg"/> : null }
        </div>
      );
    });

    return (
      <div>{squares}</div>
    );
  }
});

var Loader = React.createClass({
   render: function() {
     return (
      <div id="loading">
        <img id="loading-image" src='images/loading_apple.gif' alt='Loading...'/>
      </div>
     )
   }
});


var Message = React.createClass({
  render() {
    return (
      <div className="message">
          <strong>{this.props.pseudo}:&#160;</strong> 
          <span className="txt">{ ' ' + this.props.txt}</span>        
      </div>
    );
  }
});

var MessageList = React.createClass({
  render() {
    //console.log('opponent_sid=',this.props.opponent_sid);
    if ( typeof this.props.opponent_sid != "undefined" ){

      return (
        <div className='messages'>
            <h2 className="center"> -------- CHAT -------- </h2>
            {
                this.props.messages.map((message, i) => {
                    return (
                        <Message
                            key={i}
                            pseudo={message.pseudo}
                            txt={message.txt}
                        />
                    );
                })
            }
        </div>
      );

    }else{
      return null;
    }
  }
});



var SettingZone = React.createClass({
  handleClick: function(event) {
    //console.log(event.currentTarget.id);
    this.props.onClickDifficulty(event.currentTarget.id);
  },

  changeHandler: function(event) {
    this.props.updateInputValue(event.target.value);
    //this.setState({ text : e.target.value });
  },

  handleSendMsg: function(event) {
    //console.log('id=',event.currentTarget.id);
    //console.log('value=',document.getElementById('chat-input').value);
    var message = {
        pseudo : this.props.game.pseudo,
        txt : this.props.game.inputValue//document.getElementById('chat-input').value
    }
    this.props.onMessageSubmit(message);
    document.getElementById('chat-input').value = '';
  },

  render: function() {
    //console.log("opponentType=",this.props.game.opponentType);
    var that = this;
    switch(this.props.game.opponentType) {

        case 'robot':       
         
          var levelRows = [];
          for (var level in C4Fct.infoFromLevel) {
             var img = "images/" + C4Fct.infoFromLevel[level].img;
             var className = this.props.game.level === level ? 'level-block selected' : 'level-block';
             levelRows.push( 
              <div key={level} className={className} id={level} onClick={this.handleClick} title={C4Fct.infoFromLevel[level].speech}>
                <div className="robotFrame" >
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

          return (
            <div id="settingZone">
              <ChooseMode opponentType={this.props.game.opponentType} onClickOpponentType={this.props.onClickOpponentType}/>
              <br/>
              <div id="chat-zone">
                <div id="chat">
                  <MessageList messages={this.props.game.messages} opponent_sid={this.props.game.me.opponent_sid} />
                </div>
                <form>
                  <input id="chat-input" value={this.props.game.inputValue} onChange={this.changeHandler}></input>
                  <input id="send-msg" value="Send" type="button" onClick={this.handleSendMsg}></input>
                </form>
              </div>
            </div>
          );          
          break;

        default:
          alert("error");
    } 
  }
});
 

var Connect4 = React.createClass({
  
  componentDidUpdate : function() {

  },

  //componentDidMount is a method called automatically by React after a component is rendered for the first time. 
  componentDidMount: function() {
    var self = this;
    if ( self.state.game.opponentType === "robot"){
    //that.state.game.turn = 1 + Math.floor(2*Math.random());// 1 or 2 randomely (tells us who is going to play by is code)
      //Let the computer play     
      setTimeout(function(){
        if ( self.state.game.turn === 1 ){
          C4Fct.computerMove(self);
        }
      },2000);
    }

    socket.on('players', function (players) {
      console.log('players');
      self.state.game.players = players;
      self.forceUpdate();
    });
   
    socket.on('startGame', function (player1, player2){

      self.state.game.turn = 1;//because 1 always start
      self.state.game.me = player1;
      self.state.game.opponent = player2;
      
      self.state.game.nbMove = 0;
      self.state.game.position = [];//list of column's numbers successively played, first column is 1
      self.state.game.grid = C4Fct.emptyGrid();
        // [//game map
        //   [0, 0, 0, 0, 0, 0],//first column (grid's top first)
        //   [0, 0, 0, 0, 0, 0],
        //   [0, 0, 0, 0, 0, 0],
        //   [0, 0, 0, 0, 0, 0],
        //   [0, 0, 0, 0, 0, 0],
        //   [0, 0, 0, 0, 0, 0],
        //   [0, 0, 0, 0, 0, 0],
        // ];
      self.state.game.aligned = C4Fct.emptyGrid();
      // [//tells where to display the check symbol when 4 discs or more are aligned
      //     [0, 0, 0, 0, 0, 0],
      //     [0, 0, 0, 0, 0, 0],
      //     [0, 0, 0, 0, 0, 0],
      //     [0, 0, 0, 0, 0, 0],
      //     [0, 0, 0, 0, 0, 0],
      //     [0, 0, 0, 0, 0, 0],
      //     [0, 0, 0, 0, 0, 0],
      //   ];

      self.forceUpdate(); 
    });

    socket.on('opponentResign', function (){
      //alert('opponentResign');
      self.state.game.me = {};
      self.state.game.opponent = {};
      self.forceUpdate();  

      self.state.game.winner = self.state.game.me.turnId;
      self.state.game.turn = null;
      self.forceUpdate(function(){
        alert("You opponent resigns. You win the game!"); 
        //reinit the game
        self.state.game = new C4Fct.game();
        self.state.game.turn = null;
        self.forceUpdate();               
      });
    });


    //opponent add a disc on col
    socket.on('addDisc', function (col){
      //alert('my opponent add a disc on col '+col);

      var lastMove = C4Fct.addDisc(self.state.game, col);
      self.state.game.lastMove = lastMove;
      self.state.game.lastMove.blink = true;
      //console.log('lastMove=',lastMove); //console.log('game=',game); 
      self.state.game.nbMove++;
      self.forceUpdate();

      //it is a winning move ?
      var win = C4Fct.testWin(self.state.game, lastMove);
      if ( win ){
        self.state.game.winner = 3-self.state.game.me.turnId;
        self.state.game.turn = null;
        self.forceUpdate(function(){
          socket.emit('gameEnd');
          alert("You loose!");

          //reinit the game
          // self.state.game = new C4Fct.game();
          // //self.state.game.turn = null;
          // self.forceUpdate(); 

          //Rem: setState works asynchronously so we need to use a callback to launch the game:
          self.setState({ game : new C4Fct.game(self.state.game.level) }, function(){
            //console.log("turn:",self.state.game.turn);
            if ( self.state.game.turn === 1 ){//faire jouer la machine    
              C4Fct.computerMove(self);
            }else{
              //no code here because this.handleUserClick() will be called on the click event
            }
          });


        });   
      }else if( self.state.game.nbMove == 42 ){//if no winner and grid full then draw game 
        //self.state.game.turn = null;
        alert("draw 0-0 !");
        //reinit the game
        self.state.game = new C4Fct.game();
        self.forceUpdate();            
      } 

      self.state.game.turn = self.state.game.me.turnId;
      self.forceUpdate();       
    });

    socket.on('newMessage', function (msg){
      //console.log('newMessage:',msg)
      self.state.game.messages.push(msg);
      //forceUpdate + scroll bottom on chat windows
      self.forceUpdate(function(){
        //var chat = document.getElementById("chat");
        document.getElementById("chat").scrollTop = document.getElementById("chat").scrollHeight;  
        //document.getElementById("chat").scrollTo(0,document.getElementById("chat").scrollHeight);     
      });
    });

  },  

  getInitialState: function() {
    return {
      game: new C4Fct.game(),
      loading : true
    };
  },
  
  handleChangeDifficulty: function(value){
    this.state.game.level = value;
    this.forceUpdate();
  },

  handleOnMessageSubmit :function(msg){
    this.state.game.messages.push(msg);
    this.state.game.inputValue = '';
    this.forceUpdate();
    socket.emit('sendMessage', msg);
  },

  updateInputValue : function(value){
    this.state.game.inputValue = value;
    this.forceUpdate();
  },

  updatePseudo: function(pseudo){
    this.state.game.pseudo = pseudo;
    this.forceUpdate();
  },

  //Choose between robot or human opponent type
  handleChangeOpponentType: function(value){
    //console.log("handleChangeOpponentType:",value);

    var that = this;

    if ( value != that.state.game.opponentType ){//if user change opponentType by clicking on the opposite radiobutton

      that.state.game = new C4Fct.game();
      that.forceUpdate();      
      
      that.state.game.opponentType = value;

      if ( value === "human"){
        //If user doesn't have a pseudo we ask him to choose one (a default pseudo is given anyway)
        while ( !that.state.game.pseudo ){

          //envoyer une demande de maj de players via une web socket ici 
          socket.emit('getPlayers');
          var pseudo = prompt("Choose a pseudo please",'Guest_'+C4Fct.getRandomIntInclusive(1,999999));
          //If the pseudo is not already used by another user we send it to the server otherwise we ask the pseudo again
          console.log('pseudo:',pseudo);
          if ( pseudo && pseudo.trim().length > 0 ){

            if ( pseudo.trim().length > 15 ){
              alert("15 characters max please!");
            }else{
            //that.state.game.pseudo = pseudo; 
            //C4Fct.getPlayers(that, function(players){
              //console.log('players===>',players);
              if ( !C4Fct.isPseudoUsed(pseudo, that.state.game.players) ){
                that.state.game.pseudo = pseudo; 
                //console.log("pseudo valid:",pseudo);         
                that.updatePseudo(pseudo);
                //that.updatePlayers(players);
                //that.state.game.players = players;
                that.forceUpdate();
                //ne fonctinnera pas si le user est deconnécté de la socket
                socket.emit('addPlayer', pseudo);//we ask the server to add a new user to the users list

              }else{
                alert("This pseudo is already used, choose a new one !");
              }     
            }       
            //});
          }else{//return to robot mode
            that.setState({ game : new C4Fct.game(that.state.game.level) }, function(){
              if ( that.state.game.turn === 1 ){//faire jouer la machine    
                C4Fct.computerMove(that);
              }else{
                //no code here because this.handleUserClick() will be called on the click event
              }
            });  
            break;            
          }
        }
      }
      
      if ( value === "robot"){

        //that.state.game.connected = false;
        console.log("-opponent-:",that.state.game.opponent);
        socket.emit('leaveGame');
        that.state.game.me = {};
        that.state.game.opponent = {};
        that.forceUpdate();      
        //Rem: setState works asynchronously so we need to use a callback:
        that.setState({ game : new C4Fct.game(that.state.game.level) }, function(){
          //console.log("turn:",that.state.game.turn);
          //that.state.game.turn = 1 + Math.floor(2*Math.random());// 1 or 2 randomely (tells us who is going to play by is code)

          if ( that.state.game.turn === 1 ){//faire jouer la machine    
            C4Fct.computerMove(that);
          }else{
            //no code here because this.handleUserClick() will be called on the click event
          }
        });
      }

    }
  },

  handleUserClick: function(col) {
    //console.log('handleUserClick');

    //turn = 1 means it's computers turn to play, code = 2 means user can play, turn = null means we are out of the game    
    if ( this.state.game.opponentType === "robot"){
      //console.log('handleUserClick robot');
      switch(this.state.game.turn){
          case 1:
            alert("It's not your turn...");
            break;
          case 2://if user is allowed to play 
            //the user plays
            var lastMove = C4Fct.addDisc(this.state.game, col);
            this.state.game.lastMove = lastMove;
            this.state.game.lastMove.blink = false;

            if ( !lastMove ){ 
              alert("This column is full!");
              return;
            }; 
            //console.log('lastMove=',lastMove); //console.log('game=',game); 
            this.state.game.nbMove++;
            this.forceUpdate();

            //it is a winning move ?
            var win = C4Fct.testWin(this.state.game, lastMove);
            if ( win ){
              this.state.game.winner = 2;
              this.state.game.turn = null;
              this.forceUpdate();     
              //this.setState({ game : game });
              alert("You win!");
            }else{//IA'S turn to play

              //if no winner and grid full then draw game 
              if ( this.state.game.nbMove == 42 ){
                this.state.game.turn = null;
                alert("draw 0-0 !");
                this.forceUpdate();  
              }else{
                this.state.game.turn = 1;
                //get actual connect 4 game position in string notation       
                var pos = C4Fct.arrayToString(this.state.game.position);
                //console.log("pos=",pos);

                //get the solution from Pascal Pons "alpha beta pruning" algorithm 
                C4Fct.computerMove(this);
              }
            }            
            break;

          case null:
            //var rep = confirm("Play again ?");
            //if (rep){
              var self = this;
              //Rem: setState works asynchronously so we need to use a callback to launch the game:
              this.setState({ game : new C4Fct.game(this.state.game.level) }, function(){
                //console.log("turn:",self.state.game.turn);
                if ( self.state.game.turn === 1 ){//faire jouer la machine    
                  C4Fct.computerMove(self);
                }else{
                  //no code here because this.handleUserClick() will be called on the click event
                }
              });
            //}
            break;
          default:
            alert("Oops, an error has occurred. Please refresh the page and retry.");
      }
    }else if(this.state.game.opponentType === "human"){

      //console.log('handleUserClick human');
      if ( this.state.game.turn ){ 
        if ( this.state.game.turn != this.state.game.me.turnId ){
          alert("It's not your turn...");
        }else{//user is allowed to play 
          //alert("jouer");
          //the user plays
          var lastMove = C4Fct.addDisc(this.state.game, col);
          if ( !lastMove ){ 
            alert("This column is full!");
            return;
          }; 
          this.state.game.lastMove = lastMove;
          this.state.game.lastMove.blink = false;

          //console.log('lastMove=',lastMove); //console.log('game=',game); 
          socket.emit('addDisc',col);//tell server to tell my opponent that i add a disc on column col
          this.state.game.nbMove++;
          this.forceUpdate();

          //is it a winning move ?
          var win = C4Fct.testWin(this.state.game, lastMove);
          if ( win ){
            this.state.game.winner = this.state.game.me.turnId;
            //this.state.game.turn = null;     
            //this.setState({ game : game });
            this.forceUpdate(function(){
              socket.emit('gameEnd');
              alert("You win!"); 
              //reinit the game
              // this.state.game = new C4Fct.game();
              // this.forceUpdate();
              var self = this;
              //Rem: setState works asynchronously so we need to use a callback to launch the game:
              this.setState({ game : new C4Fct.game(this.state.game.level) }, function(){
                //console.log("turn:",self.state.game.turn);
                if ( self.state.game.turn === 1 ){//faire jouer la machine    
                  C4Fct.computerMove(self);
                }else{
                  //no code here because this.handleUserClick() will be called on the click event
                }
              });

            });                         
          }else{
            //if no winner and grid full then draw game 
            if ( this.state.game.nbMove == 42 ){
              this.state.game.turn = null;
              this.forceUpdate(function(){
                alert("draw 0-0 !");
                //reinit the game
                this.state.game = new C4Fct.game();
                this.forceUpdate();                
              });                 
            }else{//opponent's turn
              this.state.game.turn = 3-this.state.game.me.turnId;

              //socket.emit('addDisc',col);//tell server to tell opponent that i have added a disc on column col

              //get actual connect 4 game position in string notation       
              //var pos = C4Fct.arrayToString(this.state.game.position);
              //console.log("pos=",pos);

              //get the solution from Pascal Pons "alpha beta pruning" algorithm 
              //C4Fct.computerMove(this);
              this.forceUpdate();  
            }
            
          }

        }
      }else{
        //reinit the game
        this.state.game = new C4Fct.game();
        this.state.game.turn = null;
        this.forceUpdate(); 
      }

    } 


  },

  render: function() {
    //{ this.state.loading ? <Loader/> : null }
    return (
      <div id="container">
        
        <div className="content game" >
            {debug ? <Debug game={this.state.game}/> : null }
            <SettingZone 
              game = {this.state.game} 
              onClickDifficulty = {this.handleChangeDifficulty}
              onMessageSubmit = {this.handleOnMessageSubmit}
              updateInputValue = {this.updateInputValue}
              onClickOpponentType = {this.handleChangeOpponentType} /> 
            <NextTurnDisplay game = {this.state.game} />    
            <Mask game={this.state.game} onUserClick={this.handleUserClick} />
            <Grid game={this.state.game} />
        </div>
      </div>
    );
  }
});


var Debug = React.createClass({
  render: function() {
    return (
      <div>
        <div>opponentType: {this.props.game.opponentType}</div>
        <div>game.pseudo: {this.props.game.pseudo}</div>
        <div>turn: {this.props.game.turn}</div>
        <div>nbMove: {this.props.game.nbMove}</div>  
        <div>lastMove: {JSON.stringify(this.props.game.lastMove)}</div>   
        <div>Me: {JSON.stringify(this.props.game.me)}</div>
        <div>My opponent: {JSON.stringify(this.props.game.opponent)}</div>        
        <div>grid: {JSON.stringify(this.props.game.grid)}</div>
        <div>aligned: {JSON.stringify(this.props.game.aligned)}</div>
      </div>
    );
  }
});

        // <div>Me: {this.props.game.me}</div>
        // <div>My opponent: {this.props.game.opponent}</div>   
        //   <div>lastMove: {this.props.game.lastMove}</div>  
        // 
        //  <div>Me: {this.props.game.me}</div>
        // <div>grid: {this.props.game.grid}</div>  


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


//ReactDOM.render(<Loader/>, document.body);

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

