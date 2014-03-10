'use strict';

var Item = require('../models/item');
var User = require('../models/user');

exports.create = function(req, res){
  var item  = new Item(req.body);
  req.body.userId = (req.session.userId).toString();
  item.userId = req.body.userId;
  item.addPhoto(req.files.photos.path, function(){
    item.insert(function(){
      User.findById(req.body.userId, function(theUser){
        var user = new User(theUser);
        user.addItem(item);
        user.update(function(err, result){
          res.redirect('/items/'+item._id);
          //res.send({item:item});
        });
      });
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
  var userId = req.session.userId;
  Item.findById(req.params.id, function(item){
    User.findById(userId, function(user){
      res.render('item/item', {title:item.name, item:item, user:user, userId:userId});
    });
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

exports.placeBid = function(req, res){
  //var userId = req.session.userId;
  Item.findById(req.body.item1, function(item1){
    item1 = new Item(item1);
    Item.findById(req.body.item2, function(item2){
      item2 = new Item(item2);
      item1.photos = req.body.photos;

      item1.addBid(item2);
      item1.update(function(i1){
        res.redirect('/items/'+item1._id);
      });
    });
  });
};

exports.winBid = function(req, res){
  Item.findById(req.body.item1, function(item1){
    item1 = new Item(item1);
    Item.findById(req.body.item2, function(item2){
      item2 = new Item(item2);
      User.findById(req.body.user1, function(user1){
        user1 = new User(user1);
        User.findById(req.body.user2, function(user2){
          user2 = new User(user2);

          user1.winItem(item2);
          user2.winItem(item1);
          user1.removeItem(item1);
          user2.removeItem(item2);
          item1.userId = user2._id.toString();
          item2.userId = user1._id.toString();
          item1.bids = [];
          item2.bids = [];
          item1.update(function(i1){
            item2.update(function(i2){
              user1.update(function(u1){
                user2.update(function(u2){
                  //emails
                  res.redirect('/');
                });
              });
            });
          });
        });
      });
    });
  });
};
