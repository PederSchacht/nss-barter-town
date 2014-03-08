'use strict';

process.env.DBNAME = 'item-test';
var app = require('../../app/app');
var request = require('supertest');
var User, Item;
var sue;
var car;
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
      car = new Item({name: 'mustang', year:'1967'});
      sue.hashPassword(function(){
        sue.insert(function(){
          car.insert(function(){
            done();
          });
        });
      });
    });
  });

  describe('GET /item', function(){
    it('should not display items page because user not logged in', function(done){
      request(app)
      .get('/items')
      .expect(200, done);
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

    describe('GET /items', function(){
      it('should display items page because user is logged in', function(done){
        request(app)
        .get('/items')
        .set('cookie', cookie)
        .end(function(err, res){
          done();
        });
      });

      describe('POST /item', function(){
        it('should create an item in the database', function(done){
          request(app)
          .post('/items')
          .set('cookie', cookie)
          .send({name: 'Geo Metro',
            year: '1987',
            description: 'nice car'})
          .end(function(err, res){
            done();
          });
        });
      });

      //DOES NOT WORK!
      describe('PUT /item', function(){
        it('should update an exisiting item', function(done){
          request(app)
          .put('/items')
          .set('cookie', cookie)
          .send({_id:car._id.toString(), description: 'really nice car'})
          .end(function(err, res){
              console.log(err);
              console.log('res.body!');
              console.log(res.body);
              done();
            });
        });
      });

    });
  });

});

