'use strict';

var d = require('../lib/request-debug');
var initialized = false;

module.exports = function(req, res, next){
  if(!initialized){
    initialized = true;
    load(req.app, next);
  }else{
    next();
  }
};

function load(app, fn){
  var home = require('../routes/home');
  var users = require('../routes/users');
//  var items = require('../routes/items');

  app.get('/', d, home.index);

  ////Artists///
  app.get('/users', d, users.index);
  app.post('/users', d, users.create);
  
  console.log('Routes Loaded');
  fn();
}

