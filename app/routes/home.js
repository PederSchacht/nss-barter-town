'use strict';

var request = require('request');
var fs = require('fs');
var Item = require('../models/item');
var User = require('../models/user');

exports.index = function(req, res){
  Item.findAll(function(items){
    var id = req.session.userId;
    User.findById(id, function(user){
      Item.findByUser(id, function(userItems){
        res.render('home/index', {title: 'Barter Town', user:user, userItems:userItems, items:items});
      });
    });
  });
};

exports.newItem = function(req, res){
  res.render('item/new', {title: 'New Item'});
};

exports.email = function(req, res){
  var key = process.env.MAILGUN;
  var url = 'https://api:' + key + '@api.mailgun.net/v2/sandbox7244.mailgun.org/messages';
  var post = request.post(url, function(err, response, body){
    res.redirect('/');
  });
  var form = post.form();
  form.append('from', 'chyld.medford@gmail.com');
  form.append('to', req.body.to);
  form.append('subject', req.body.subject);
  //form.append('text', req.body.body);
  form.append('html', req.body.body);
  form.append('attachment', fs.createReadStream(__dirname + '/../static/img/money.jpg'));
  form.append('attachment', fs.createReadStream(__dirname + '/../static/img/startup.jpg'));
};

