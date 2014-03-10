'use strict';

var Item = require('../models/item');

exports.create = function(req, res){
  req.body.userId = (req.session.userId).toString();
  var item  = new Item(req.body);
  console.log('THIS IS THE REQ: ', req.files);
  item.addPhoto(req.files.photos.path, function(){
    item.insert(function(){
      //res.redirect('/items');
      res.send({item:item});
    });
  });
};

exports.update = function(req, res){
  var item = new Item(req.body);
  item.update(function(){
    res.send({item:item});
  });
};

exports.showItem = function(req, res){
  Item.findById(req.params.id, function(item){
    res.render('item/item', {item:item});
  });
};

exports.userItems = function(req, res){
  Item.findByUserId(req.session.userId, function(items){
    res.send({items:items});
  });
};

exports.index = function(req, res){
  Item.findAll(function(items){
    res.send({items:items});
  });
};

exports.filter = function(req, res){
  var type = req.body.type;
  var input = req.body.which.replace('%20', ' ');
  switch(type){
    case 'tag':
      Item.findByTag(input, function(items){
        res.send({items:items});
      });
      break;
    case 'year':
      Item.findByYear(input, function(items){
        res.send({items:items});
      });
      break;
    case 'user':
      Item.findByUser(input, function(items){
        res.send({items:items});
      });
      break;
    case 'name':
      Item.findByName(input, function(items){
        res.send({items:items});
      });
      break;
    default:
  }
};
