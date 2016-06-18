var assert = require('assert'),
test = require('selenium-webdriver/testing'),//promise manager 
selenium = require('selenium-webdriver');
//LandingPage =  require('./landing-page.js');
var until = selenium.until;
var by = selenium.By;
var expect    = require("chai").expect;//des trucs en plus du assert de node js 
const mochaTimeOut = 60000;

//Doc --> 
//http://seleniumhq.github.io/selenium/docs/api/javascript/index.html
//https://github.com/SeleniumHQ/selenium/wiki/WebDriverJs
//http://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/chrome_exports_Driver.html
//exemples: https://github.com/umaar/webdriverjs-recipes
//http://testerstories.com/2016/02/javascript-with-selenium-webdriver-and-mocha/

// before: runs before all tests in this block
// beforeEach : runs before each test in this block
test.before(function() {
  this.timeout(mochaTimeOut);
  driver = new selenium.Builder()
    .withCapabilities(selenium.Capabilities.chrome())
    .build();
  //Next we open up the browser and navigate to our URL
  driver.get("http://localhost:8080");
});

test.after(function() {
  driver.quit();
});



test.describe('e2e: Landing page connect 4', function() {
    
	this.retries(4);// Retry all tests in this suite up to 4 times
    this.timeout(mochaTimeOut);

    test.it('menuBar id exist', function(done) {
    	console.log('-----');
	     // Test to ensure we are on the home page by checking the menuBar id attribute
	    driver.isElementPresent(selenium.By.id('menuBar')).then(function(present) {
	      assert.equal(present, true,'no menubar id found');
	    });
	    
	    driver.isElementPresent(selenium.By.id('mask-col-0')).then(function(present) {
	      assert.equal(present, true,'no mask-col-0 found');
	      //console.log('found!');
	    });
		
    	//driver.sleep(15000);//not good

    	 // Test to ensure we can play are on the home page by checking the menuBar id attribute
    	setTimeout(function(){
			var i = 0;
			var id = setInterval(function(){
				var script = "document.getElementById('mask-col-"+i+"').click();";
				driver.executeScript(script);
				i++;
				if ( i === 7 ){ 
					clearInterval(id);
					driver.executeScript(function() {
						return document.getElementsByClassName('redDisc').length
					}).then(function(n) {
						//check n here 
						console.log(n);
						expect(n).to.be.above(5);
					});					
					done();//pour passer à la suite 
				}
			},2000);
		},8000);	
		
		//done();//pour passer à la suite 
    });

    test.it('go to about page', function() {
    	var selector = '#menuBar > a:nth-child(2)';
		driver.findElement(selenium.By.css(selector)).click().then(function() {

		    driver.isElementPresent(selenium.By.css('.about')).then(function(present) {
		      assert.equal(present, true,'pas de about classe');
		    });
		  
			driver.getTitle().then(function(title) {
				assert.equal(title, 'Connect 4','no page title');
			});		   
		    
			driver.executeScript(function() {
				return document.querySelector('.title').innerHTML;
			}).then(function(innerHTML) {
				//check content here 
				assert.equal(innerHTML, 'ABOUT','no about title');
			});

	    });
	    driver.sleep(2000);
    });


    test.it('go to contact page', function() {
		driver.findElement(selenium.By.css('#menuBar > a:nth-child(3)')).click().then(function() {

		    driver.isElementPresent(selenium.By.css('.contact')).then(function(present) {
		      assert.equal(present, true,'no contact class');
		    });	   
		    
			driver.executeScript(function() {
				return document.querySelector('.title').innerHTML;
			}).then(function(innerHTML) {
				//check content here 
				assert.equal(innerHTML, 'CONTACT','no contact title');
			});
	    });
	    driver.sleep(2000);
    });
});

//var script = "document.querySelector('#mw-content-text > p').innerHTML = '" + html + "'";
//browser.executeScript(script).then(promise.fulfill);
//This simple test will test that we can type “simple programmer” into Google’s search box and verify that the text is there.
// test.describe('Google Search', function() {

//   this.timeout(mochaTimeOut);	
//   test.it('should work', function() {

//     var driver = new selenium.Builder().
// 	    withCapabilities(selenium.Capabilities.chrome()).
// 	    build();

// 	driver.get('http://www.google.com');
    
//     var searchBox = driver.findElement(selenium.By.name('q'));//ok
//     searchBox.sendKeys('simple programmer');
//     searchBox.getAttribute('value').then(function(value) {
//       assert.equal(value, 'simple programmer');//ok
//     });
//     driver.quit();
  
//   });
// });