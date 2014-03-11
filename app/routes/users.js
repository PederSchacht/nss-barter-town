'use strict';

var User = require('../models/user');
var request = require('request');

exports.auth = function(req, res){
  res.render('users/auth', {title: 'User Authentication'});
};

exports.register = function(req, res){
  var user = new User(req.body);
  user.addPhoto(req.files.photos.path, function(){
    user.hashPassword(function(){
      user.insert(function(){
        if(user._id){
          res.redirect('/');
        }else{
          res.render('users/auth', {title: 'User Authentication'});
        }
      });
    });
  });
};

exports.login = function(req, res){
  User.findByEmailAndPassword(req.body.email, req.body.password, function(user){
    if(user){
      req.session.regenerate(function(){
        req.session.userId = user._id.toString();
        req.session.save(function(){
          res.redirect('/');
        });
      });
    }else{
      req.session.destroy(function(){
        res.render('users/auth', {title: 'User Authentication'});
      });
    }
  });
};

exports.logout = function(req, res){
  req.session.destroy(function(){
    res.redirect('/');
  });
};

exports.profile = function(req, res){
  var id = req.session.userId;
  User.findById(id, function(user){
    res.render('users/profile', {title:user.email, user:user});
  });
};

exports.editProfile = function(req, res){
  var id = req.session.userId;
  User.findById(id, function(user){
    var u1 = new User(user);
    if(req.body.userName){
      u1.userName = req.body.userName;
    }
    if(req.body.email){
      u1.email = req.body.email;
    }
    if(req.files.photo.originalFilename){
      u1.addPhoto(req.files.photo.path, function(){
        u1.update(function(err, result){
          res.redirect('/');
        });
      });
    } else {
      u1.update(function(err, result){
        res.redirect('/');
      });
    }
  });
};

exports.email = function(req, res){
  console.log('HEY THIS IS EXPORTS EMAIL. REQ: ', req);
  var key = process.env.MAILGUN;
  var id = req.session.userId;
  var url = 'https://api:' + key + '@api.mailgun.net/v2/sandbox57340.mailgun.org/messages';
  var post = request.post(url, function(err, response, body){
    res.send('/');
  });
  var form = post.form();
  User.findById(id, function(user){
    form.append('from', 'myAss@yourMom.com');
    form.append('to', user.email);
    form.append('subject', 'Your Barter Town Account');
    form.append('text', 'Hey you clicked some stuff on Barter Town. Whassssuuuuppppp????!!!!!!');
  });
  //form.append('html', req.body.body);
  //form.append('attachment', fs.createReadStream(__dirname + '/../static/img/acadia.jpg'));
};



















