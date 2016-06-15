
var React = require('react');

module.exports = React.createClass({
  render: function() {
      return (
        <div className="content about"> 
          <h1 className="title">ABOUT</h1>
          <div className="pg">
          
          <h2 className="sub-title">Purpose of this web site</h2>
          This is a connect 4 responsive web site implemented with React and NodeJS. 
           I developed it in order to practice (and learn) ReactJS. 
          <h2 className="sub-title">Rules</h2>
          Connect four (also called Gravitrips in Soviet Union) is a two players strategy game. 
          Each player drops alternatively a chip of his colors into a grid. The first player to align four chips wins.
          
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
