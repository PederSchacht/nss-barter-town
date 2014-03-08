'use strict';

module.exports = Item;
var items = global.nss.db.collection('items');
var Mongo = require('mongodb');
var _ = require('lodash');

function Item(item){
  this.name = item.name;
  this.year = item.year;
  this.desc = item.desc;
  this.cost = item.cost;
  this.tags = item.tags;
  this.status = 'Available';
  this.photos = [];
  this.userId = '';
  this.bids = [];
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

Item.prototype.addBids = function(ids){
  //ids should be an array of item ids as strings.
  //put these into the bids array.
  var self = this;
  _.each(ids, function(id){
    self.bids.push(id);
  });
};

/*
Item.prototype.removeBids = function(id){
  //id should be a user's id as a string.
  //remove the bids by the specified user.
  var self = this;

};
*/

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
