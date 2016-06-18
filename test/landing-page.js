var webdriver = require('selenium-webdriver');
 
LandingPage = function LandingPage(driver) {
  this.driver = driver;
  this.url = "http://localhost:8080";
};
 
LandingPage.prototype.view = function() {
  this.driver.get(this.url);
  return webdriver.promise.fulfilled(true);
};
 

LandingPage.prototype.menuBarIdExist = function() {
  // var d = webdriver.promise.defer();
  // this.driver.isElementPresent(webdriver.By.id('menuBar')).then(function(present) {
  //   d.fulfill(present);
  // });
  // return d.promise;
  return this.driver.isElementPresent(webdriver.By.id('menuBar'));
};


LandingPage.prototype.clickOnBoard = function() {
  // var d = webdriver.promise.defer();
  // this.driver.isElementPresent(webdriver.By.id('menuBar')).then(function(present) {
  //   d.fulfill(present);
  // });
  // return d.promise;
  return this.driver.click(webdriver.By.id('#\30 '));
};


module.exports = LandingPage;