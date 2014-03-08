'use strict';

var Item = require('../models/item');

exports.create = function(req, res){
  req.body.userId = req.session.userId;
  var item  = new Item(req.body);
  item.insert(function(){
    //res.redirect('/items');
    res.send({item:item});
  });
};

exports.update = function(req, res){
  var item = new Item(req.body);
  item.update(function(){
    res.send({item:item});
  });
};

exports.show = function(req, res){
  Item.findByUserId(req.session.userId, function(items){
    res.send({items:items});
  });
};

exports.index = function(req, res){
  Item.findAll(function(items){
    res.send({items:items});
  });
};
