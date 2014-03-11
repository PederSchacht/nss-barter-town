'use strict';

module.exports = User;
var fs = require('fs');
var path = require('path');
var bcrypt = require('bcrypt');
var users = global.nss.db.collection('users');
var Mongo = require('mongodb');
var _ = require('lodash');

function User(user){
  this._id = user._id;
  this.userName = user.userName;
  this.email = user.email;
  this.password = user.password;
  this.photo = user.photo;
  this.items = user.items || [];
  this.itemsWon = user.itemsWon || [];
}

User.prototype.update = function(fn){
  var self = this;
  users.update({_id: self._id}, self, function(err, result){
    fn(result);
  });
};

User.prototype.hashPassword = function(fn){
  var self = this;

  bcrypt.hash(self.password, 8, function(err, hash){
    self.password = hash;
    fn(err);
  });
};
User.prototype.insert = function(fn){
  var self = this;

  users.findOne({email:self.email}, function(err, record){
    if(!record){
      users.insert(self, function(err, records){
        fn(err);
      });
    }else{
      fn(err);
    }
  });
};

User.prototype.addPhoto = function(oldname, fn){
  var self = this;
  var emailDir = this.email.replace('@', '-').toLowerCase();
  var dirname = emailDir.replace('.', '-').toLowerCase();
  //var dirname = this.name.replace(/\s/g,'').toLowerCase();
  var abspath = __dirname + '/../static';
  var relpath = '/img/' + dirname;
  var extension = path.extname(oldname);

  fs.mkdir(abspath + relpath, function(){
    relpath += '/photo' + extension;
    fs.rename(oldname, abspath + relpath, function(err){
      self.photo = relpath;
      fn(err);
    });
  });
};

User.findById = function(id, fn){
  var _id = Mongo.ObjectID(id);

  users.findOne({_id:_id}, function(err, record){
    fn(record);
  });
};

User.findByEmailAndPassword = function(email, password, fn){
  users.findOne({email:email}, function(err, record){
    if(record){
      bcrypt.compare(password, record.password, function(err, result){
        if(result){
          fn(record);
        }else{
          fn(null);
        }
      });
    }else{
      fn(null);
    }
  });
};

User.prototype.addItem = function(item){
  this.items.unshift(item);
};

User.prototype.removeItem = function(item){
  _.remove(this.items, function(temp){return temp===item;});
};

User.prototype.winItem = function(item){
  var string = item.year+' '+item.name;
  this.itemsWon.push(string);
};
