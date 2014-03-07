'use strict';

module.exports = function(req, res, next){
  var User = require('../models/user');

  console.log('xxxxxxxxxxxxreqsession');
  console.log(req.session);

  User.findById(req.session.userId, function(user){
    res.locals.user = user;

    next();
  });
};
