'use strict';

module.exports = Item;
var items = global.nss.db.collection('items');
var Mongo = require('mongodb');
var _ = require('lodash');
var fs = require('fs');
var path = require('path');

function Item(item){
  this.name = item.name;
  this.year = item.year;
  this.desc = item.desc;
  this.cost = item.cost;
  this.tags = item.tags;
  this.status = 'Available';
  this.photos = [];
  this.userId = item.userId;
  this.bids = [];
  this._id = item._id;
}

Item.prototype.insert = function(fn){
  var self = this;
  items.insert(self, function(err, records){
    fn(err, records);
  });
};

Item.prototype.changeStatus = function(){
  var self = this;
  if(self.status === 'Available'){
    self.status = 'Offered';
  }else{
    self.status = 'Available';
  }
};

Item.prototype.update = function(fn){
  var self = this;
  items.update({_id: self._id}, self, function(err, result){
    fn(result);
  });
};

Item.prototype.addUser = function(id){
  this.userId = id;
};

Item.prototype.addBids = function(bids){
  //bids should be an array of objects
  //each object has an item id and a user id, both strings
  //put these into the bids array.
  var self = this;
  _.each(bids, function(bid){
    self.bids.push(bid);
  });
};

Item.prototype.removeBidsByUser = function(id){
  //id should be a user's id as a string.
  //remove the bids by the specified user.
  var self = this;
  self.bids = _.reject(self.bids, function(bid){
    return bid.userId === id;
  });
};

Item.prototype.addPhoto = function(oldname, fn){
  var self = this;
  var extension = path.extname(oldname);
  var itemName = this.name.replace(/\s/g, '').toLowerCase();
  var year = this.year;
  var absolutePath = __dirname + '/../static';
  var pathImgBarter = absolutePath + '/img/' + 'barter/';
  var pathImgBarterItem = pathImgBarter + itemName + '/';
  var pathImgBarterItemYear = pathImgBarterItem + year + '/';
  
  var relativePath = '/img/' + 'barter/' + itemName + '/' + year + '/' + this.photos.length + extension;

  fs.mkdir(pathImgBarter, function(){
    fs.mkdir(pathImgBarterItem, function(){
      fs.mkdir(pathImgBarterItemYear, function(){
        //console.log('Item addPhoto: ', oldname, absolutePath, absolutePath + relativePath);
        fs.rename(oldname, absolutePath + relativePath, function(err){
          self.photos.push(relativePath);
          fn(err);
        });
      });
    });
  });
};

Item.destroy = function(id, fn){
  var _id = Mongo.ObjectID(id);

  items.remove({_id:_id}, function(err, count){
    fn(count);
  });
};

Item.findById = function(id, fn){
  var _id = Mongo.ObjectID(id);

  items.findOne({_id:_id}, function(err, record){
    fn(record);
  });
};

Item.findAll = function(fn){
  items.find().toArray(function(err, records){
    fn(records);
  });
};

Item.findByTag = function(tag, fn){
  items.find().toArray(function(err, records){
    var results = [];
    _.each(records, function(record){
      _.each(record.tags, function(oneTag){
        if(oneTag === tag){
          results.push(record);
        }
      });
    });
    fn(results);
  });
};

Item.findByYear = function(year, fn){
  items.find({year:year}).toArray(function(err, records){
    fn(records);
  });
};

Item.findByName = function(name, fn){
  items.find({name:name}).toArray(function(err, records){
    fn(records);
  });
};

Item.findByUser = function(userId, fn){
  items.find({userId: userId}).toArray(function(err, records){
    fn(records);
  });
};
