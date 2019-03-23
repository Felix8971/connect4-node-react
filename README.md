# connect4-node-react
A responsive multiplayers connect 4 game implemented with React, NodeJS and socket.io.
You can also play against an artificial intelligence with 5 differents difficulty levels.
  
### Pre-requirements
- node & npm

### To get started

1. `cd` into your project directory.
2. run `npm install`  (nodejs packages installation)
3. run `export PATH=$PATH:./node_modules/.bin` to make the webpack command work locally
4. run `node server.js` or 'nodejs server.js` (for ubuntu)  ('npm run start' also works )
5. visit <http://localhost:8080/> and enjoy !


### Developpement 
1. After code modification run `webpack --progress --colors` to compile js and css files with webpack 
   (you can add -p or --production option if you want to minify all of that)
2. run `node server.js` or 'nodejs server.js` (for ubuntu)  ('npm run start' also works )


### Artificial intelligence part
This game used the "alpha beta pruning" algorithm created by Pascal Pons (https://www.linkedin.com/in/pascalpons)

### Ran into problems, or have any suggestions?
Email me on felix8971@hotmail.com or [open an issue](https://github.com/felix8971/connect4-node-react
/issues).

The sole purpose of this project was to practice (and learn) ReactJS, please be kind :)

===

![alt tag](http://felixdebon.com/portfolio/images/connect4-1.jpg)
