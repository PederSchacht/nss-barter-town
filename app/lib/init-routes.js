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
  var items = require('../routes/items');

  app.get('/', d, home.index);
  app.get('/new', d, home.newItem);

//  app.get('/auth', d, users.auth);
  app.post('/register', d, users.register);
  app.post('/login', d, users.login);
  app.post('/logout', d, users.logout);
  app.get('/profile', d, users.profile);
  app.put('/profile', d, users.editProfile);

  app.get('/items/:id', d, items.showItem);
  app.get('/items', d, items.index);
  app.post('/items', d, items.create);
  app.put('/items', d, items.update);

  app.post('/place', d, items.placeBid);
  app.post('/win', d, items.winBid);
  app.post('/filter', d, items.filter);
  app.post('/users-email', d, users.email);
  //app.post('/items-email', d, items.email);

  console.log('Routes Loaded');
  fn();
}

