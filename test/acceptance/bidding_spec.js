'use strict';

process.env.DBNAME = 'item-test';
var app = require('../../app/app');
var request = require('supertest');
var User, Item;
var sue;
var car;
var betty;
var chair;
var cookie;

describe('users', function(){

  before(function(done){
    request(app)
    .get('/')
    .end(function(err, res){
      User = require('../../app/models/user');
      Item = require('../../app/models/item');
      done();
    });
  });

  beforeEach(function(done){
    global.nss.db.dropDatabase(function(err, result){
      sue = new User({email:'sue@aol.com', password:'abcd'});
      betty = new User({email: 'betty@aol.com', password: '1234'});
      car = new Item({name: 'mustang', year:'1967', tags:['mustang', 'red', 'auto', 'muscle car']});
      chair = new Item({name: 'chair', year:'2000', tags:['wooden', 'chair']});
      sue.hashPassword(function(){
        sue.insert(function(){
          car.userId = sue._id.toString();
          car.insert(function(){
            betty.hashPassword(function(){
              betty.insert(function(){
                chair.insert(function(){
                  done();
                });
              });
            });
          });
        });
      });
    });
  });

  describe('AUTHORIZED', function(){
    beforeEach(function(done){
      request(app)
      .post('/login')
      .field('email', 'sue@aol.com')
      .field('password', 'abcd')
      .end(function(err, res){
        cookie = res.headers['set-cookie'];
        done();
      });
    });

/*
    describe('GET /items', function(){
      it('should display items page because user is logged in', function(done){
        request(app)
        .get('/items')
        .set('cookie', cookie)
        .end(function(err, res){
          done();
        });
      });
    });
*/

    describe('place bid', function(){
      it('should place a bid', function(done){
        request(app)
        .post('/place')
        .set('cookie', cookie)
        .send({item1:chair._id.toString(),
               item2:car._id.toString(),
               user1:betty._id.toString(),
               user2:sue._id.toString()})
        .end(function(err, res){
          console.log('err!');
          console.log(err);
          console.log('res.body');
          console.log(res.body.item2);
          done();
        });
      });
    });

    //END SECTION
  });

  //END DOCUMENT
});

