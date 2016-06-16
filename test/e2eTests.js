var assert = require('assert'),
test = require('selenium-webdriver/testing'),//promise manager 
webdriver = require('selenium-webdriver');
const timeOut = 15000;


//This simple test will test that we can type “simple programmer” into Google’s search box and verify that the text is there.
test.describe('Google Search', function() {

  this.timeout(timeOut);	
  test.it('should work', function() {

    var driver = new webdriver.Builder().
	    withCapabilities(webdriver.Capabilities.chrome()).
	    build();

	driver.get('http://www.google.com');
    
    var searchBox = driver.findElement(webdriver.By.name('q'));//ok
    searchBox.sendKeys('simple programmer');
    searchBox.getAttribute('value').then(function(value) {
      assert.equal(value, 'simple programmer');//ok
    });
    driver.quit();
  
  });
});


// describe('calculating weights', function() {
//   this.timeout(timeOut);
//   test.it('calculates weights', function() {
//     var driver = new webdriver.Builder()
//         .withCapabilities(webdriver.Capabilities.chrome())//firefox())
//         .build();
 
//     driver.get("https://decohere.herokuapp.com/planets");
 
//     driver.isElementPresent(webdriver.By.id('wt')).then(function(weight) {
//       assert.equal(weight, true, "Weight entry not possible");
//     });
 
//     driver.quit();
//   });
// });