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
  item._id = req.body.id;
  item.photos = req.body.origPhotos;
  item.update(function(){
    res.redirect('/items/'+req.body.id);
    //res.redirect('/');
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

/*
exports.index = function(req, res){
  Item.findAll(function(items){
    res.send({items:items});
  });
};
*/

exports.filter = function(req, res){
  var type = req.body.type;
  var input = req.body.which.replace('%20', ' ');
  if(!req.body.page){var page=0;}
  switch(type){
    case 'tag':
      Item.findByTag(input, function(items){
        res.render('item/show', {page:page, kind:'tag', which:input, title:'Search Results', items:items});
      });
      break;
    case 'year':
      Item.findByYear(input, page, function(items){
        res.render('item/show', {page:page, kind:'year', which:input,  title:'Search Results', items:items});
      });
      break;
    case 'user':
      Item.findByUser(input, function(items){
        res.render('item/show', {page:page, kind:'user', which:input, title:'Search Results', items:items});
      });
      break;
    case 'name':
      Item.findByName(input, page, function(items){
        res.render('item/show', {page:page, kind:'name', which:input, title:'Search Results', items:items});
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
  Item.findById(req.body.origItem, function(origItem){
    origItem = new Item(origItem);
    Item.findById(req.body.bidItem, function(bidItem){
      bidItem = new Item(bidItem);
      User.findById(req.body.origUser, function(origUser){
        origUser = new User(origUser);
        User.findById(bidItem.userId, function(bidUser){
          bidUser = new User(bidUser);
          var origPhotos = req.body.origPhotos;
          var bidPhotos = bidItem.photos;

          origItem.bids = [];
          bidItem.bids = [];
          origItem.userId = bidUser._id.toString();
          bidItem.userId = origUser._id.toString();
          origUser.winItem(bidItem);
          bidUser.winItem(origItem);
          origUser.addItem(bidItem);
          bidUser.addItem(origItem);
          origUser.removeItem(origItem._id);
          bidUser.removeItem(bidItem._id);
          origItem.photos = origPhotos;
          bidItem.photos = bidPhotos;

          origItem.update(function(i1){
            bidItem.update(function(i2){
              origUser.update(function(u1){
                bidUser.update(function(u2){
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
