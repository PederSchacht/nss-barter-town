'use strict';

module.exports = User;
var fs = require('fs');
var path = require('path');
var bcrypt = require('bcrypt');
var users = global.nss.db.collection('users');
//var Mongo = require('mongodb');

function User(user){
//  this._id - user._id;
  this.name = user.name;
  this.email = user.email;
  this.password = user.password;
  this.photo = user.photo;
}

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
User.prototype.addPhoto = function(oldname){
  var dirname = this.name.replace(/\s/g,'').toLowerCase();
  var abspath = __dirname + '/../static';
  var relpath = '/img/' + dirname;
  fs.mkdirSync(abspath + relpath);

  var extension = path.extname(oldname);
  relpath += '/photo' + extension;
  fs.renameSync(oldname, abspath + relpath);

  this.photo = relpath;
};

