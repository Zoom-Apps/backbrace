'use strict';

var $settings = require('../settings'),
  $ = require('../../external/jquery'),
  HeaderComponent = require('./header');

/**
 * Base application component.
 * @class
 */
function AppComponent() {
  this.header = new HeaderComponent();
  /** @type {JQuery} */
  this.main = null;
}

AppComponent.prototype.load = function(container) {

  this.main = $('<div class="main"></div>').appendTo(container);

  $('body').addClass($settings.mobile ? 'mobile-app' : 'desktop-app');

  // Load components.
  this.header.load(this.main);

  this.header.loadMenu();

};

AppComponent.prototype.loadPage = function(name) {
  //var pge = new PageComponent(name);
  //return pge.load(this.main);
};

module.exports = AppComponent;