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
  this.status = 'Available';
  this.photos = [];
}

Item.prototype.insert = function(fn){
  var self = this;
  items.insert(self, function(err, records){
    fn(err);
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

