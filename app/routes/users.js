'use strict';
var User = require('../models/user');
//var moment = require('moment');

exports.create = function(req, res){
  var user = new User(req.body);
  console.log(req.body);
  user.save(function(){
    res.send(user);
  });
};
