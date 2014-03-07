'use strict';

module.exports = Item;
var items = global.nss.db.collection('items');
var Mongo = require('mongodb');

function Item(item){
  this.name = item.name;
  this.year = item.year;
  this.desc = item.desc;
  this.cost = item.cost;
  this.tags = item.tags;
  this.avaliability = item.avaliability;
}

Item.prototype.insert = function(fn){
  var self = this;
  items.insert(self, function(err, records){
    fn(err);
  });
};

Item.destroy = function(id, fn){
  var _id = Mongo.ObjectID(id);

  items.remove({_id:_id}, function(err, count){
    fn(count);
  });
};

