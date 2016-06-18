//tests unitaires
var assert = require('assert');
var expect    = require("chai").expect;//des trucs en plus du assert de node js 
//var webdriver = require('selenium-webdriver');
var C4Fct = require('../public/scripts/connect4Fct.js');


describe('ut: getRandomIntInclusive', function(){

	var a = [0,0,0], moy=0, array = [1,2,3];
		
	it('should return 0', function(){
		for(var i=0;i<4000;i++){
			var n = C4Fct.getRandomIntInclusive(1,3);
			a[n-1] = 1;
			moy += n;
		}
		moy = parseInt(Math.abs(10*(moy/4000 - 2))); 
		//console.log('moy=',moy);
		assert.equal(a[0]+a[1]+a[2], 3,'La somme a echouée');
		assert.equal(moy, 0,'La moyenne a echouée');
	})
});


describe('ut: getRandomElementInArray', function(){
	var a = [0,0,0], moy=0, array = [1,2,3];
	it('should return 0', function(){
		for(var i=0;i<4000;i++){
			var n = C4Fct.getRandomElementInArray(array);
			a[n-1] = 1;
			moy += n;
		}
		moy = parseInt(Math.abs(10*(moy/4000 - 2))); 
		//console.log('moy=',moy);
		assert.equal(a[0]+a[1]+a[2], 3,'La somme a echouée');
		assert.equal(moy, 0,'La moyenne a echouée');
	})
});


describe('ut: isPseudoUsed', function(){
	var players = { 
		"s6546r5f4": { pseudo:"toto", sid:"s6546r5f4", dispo:true, opponent_sid:null, img:'human.png' },
		"a6348H4f5": { pseudo:"titi", sid:"a6348H4f5", dispo:true, opponent_sid:null, img:'human.png' },
	}, pseudo1 = 'titi', pseudo2 = 'zozor';

	it('should return true', function(){
		assert.equal(C4Fct.isPseudoUsed(pseudo1, players),true,'');
	});
	it('should return false', function(){
		assert.equal(C4Fct.isPseudoUsed(pseudo2, players),false,'');
	});
});


describe('ut: emptyGrid', function(){

	var grid = [//game map
      [0, 0, 0, 0, 0, 0],//first column (grid's top first)
      [0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0],
    ];

	it('should be a funtion', function(){
		expect(C4Fct.emptyGrid).to.be.a("function");//avec chai
	})	

	it('should be deep equal', function(){
		expect(C4Fct.emptyGrid()).to.deep.equal(grid);
		//assert.deepEqual(C4Fct.emptyGrid(), grid,'');
	});

	// it('should return 7', function(){
	// 	assert.equal(C4Fct.emptyGrid().length,7,'');
	// });
	
	// it('should return 6', function(){
	// 	assert.equal(C4Fct.emptyGrid()[0].length,6,'');
	// });
	
});


describe('ut: getArrayStat', function(){
	var statSorted = [
		{occurrence:1, positions:[3], value:15 },
		{occurrence:1, positions:[4], value:6 },
		{occurrence:1, positions:[2], value:3 },
		{occurrence:2, positions:[0,1], value:2 }
	]; 

	it('should return correct stats object', function(){
		expect( C4Fct.getArrayStat([2,2,3,15,6,100,100]) ).to.deep.equal(statSorted);
	});

});


//testWin
describe('ut: addDisc', function(){
	
	var game = new C4Fct.game();
	
	game.grid = [//game map
		[0, 0, 0, 0, 0, 1],//first column (grid's top first)
		[0, 0, 0, 0, 1, 1],
		[0, 0, 0, 1, 2, 1],
		[0, 0, 0, 2, 1, 2],
		[0, 1, 2, 2, 1, 2],
		[0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0],
	];//game matrix map

	game.turn = 1;
	var lastMove = C4Fct.addDisc(game, 3);
   
	//console.log(game);

	it('should add disc on grid', function(){
		//console.log(game);
		assert.equal(game.grid[3][2], 1,'');
	});

	it('should return correct lastMove object', function(){
		//console.log(game);
		expect( lastMove ).to.deep.equal({
			col:3,
			line:2,
			turn:1,
			blink:false
		});
	});
});

//testWin
describe('ut: testWin', function(){
	
	var game = new C4Fct.game();
	
	game.grid = [//game map
		[0, 0, 0, 0, 0, 1],//first column (grid's top first)
		[0, 0, 0, 0, 1, 1],
		[0, 0, 0, 1, 2, 1],
		[0, 0, 0, 2, 1, 2],
		[0, 1, 2, 2, 1, 2],
		[0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0],
	];//game matrix map

	game.turn = 1;
	var lastMove = C4Fct.addDisc(game, 3);

	//console.log(game);

	it('1. should win', function(){
		//console.log(game);
		assert.equal(C4Fct.testWin(game, lastMove),true ,'');
	});
	
	it('2. should not win', function(){
		//console.log(game);
		C4Fct.removeDisc(game, 3);
		var lastMove = C4Fct.addDisc(game, 5);
		assert.equal(C4Fct.testWin(game, lastMove),false ,'');
		//console.log(game);
	});

	it('3. should win', function(){
		var game = new C4Fct.game();
		game.turn = 2;
		game.grid[2] = [0, 2, 2, 2, 1, 1];
		var lastMove = C4Fct.addDisc(game, 2);
		assert.equal(C4Fct.testWin(game, lastMove),true ,'');
	});

	it('4. should win', function(){
		var game = new C4Fct.game();
		game.turn = 1;
		game.grid = [//game map
			[0, 0, 0, 0, 2, 1],//first column (grid's top first)
			[0, 0, 0, 0, 1, 1],
			[0, 0, 0, 0, 1, 1],
			[0, 0, 0, 0, 1, 2],
			[0, 0, 0, 0, 0, 2],
			[0, 0, 0, 0, 2, 0],
			[0, 0, 0, 0, 0, 0],
		];//game matrix map
		var lastMove = C4Fct.addDisc(game, 4);
		assert.equal(C4Fct.testWin(game, lastMove),true ,'');
	});

	it('5. should not win');//à ecrire

});


describe('ut: #test asynchronous', function(){
	it('should say hello', function(done){
		C4Fct.test(function(){
			assert.equal(1,1);
			done();
		});
	});
});