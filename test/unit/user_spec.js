/* jshint expr:true */

'use strict';


process.env.DBNAME = 'bartertown-test';
var expect = require('chai').expect;
var exec = require('child_process').exec;
var Mongo = require('mongodb');
var fs = require('fs');
var User;
//var Item;
var id;

describe('User', function(){
  var user;

  before(function(done){
    var initMongo = require('../../app/lib/init-mongo');
    initMongo.db(function(){
      User = require('../../app/models/user');
//      Item = require('../../app/models/item');
      done();
    });
  });

  beforeEach(function(done){
    var testdir =__dirname + '/../../app/static//test*';
    var cmd = 'rm -rf' + testdir;

    exec(cmd, function(){
      var origfile = __dirname + '/../fixtures/tempPhoto.jpg';
      var copyfile = __dirname + '/../fixtures/tempPhoto-copy.jpg';
      fs.createReadStream(origfile).pipe(fs.createWriteStream(copyfile));
      global.nss.db.dropDatabase(function(err,result){
        user = new User({email:'sue@aol.com', password:'abcd'});
        var oldname = __dirname + '/../fixtures/tempPhoto-copy.jpg';
        user.hashPassword(function(){
          user.addPhoto(oldname);
          user.insert(function(){
            id = user._id.toString();
            done();
          });
        });
      });
    });
  });

  describe('new', function(){
    it('should create a new User object', function(){
      var u1 = new User({email:'bob@aol.com', password:'1234'});
      expect(u1).to.be.instanceof(User);
      expect(u1.email).to.equal('bob@aol.com');
      expect(u1.password).to.equal('1234');
    });
  });
  describe('#hashPassword', function(){
    it('should hash a password with salt', function(done){
      var u1 = new User({email:'bob@aol.com', password:'1234'});
      u1.hashPassword(function(){
        expect(u1.password).to.not.equal('1234');
        done();
      });
    });
  });

  describe('#addPhoto', function(){
    it('should add a photo to User', function(){
      expect(user.photo).to.equal('/img/sueTest.jpg');
    });
  });

  describe('#insert', function(){
    it('should insert user into mongo', function(done){
      var u1 = new User({email:'bob@aol.com', password:'1234'});
      u1.hashPassword(function(){
        u1.insert(function(){
          expect(u1._id).to.be.instanceof(Mongo.ObjectID);
          done();
        });
      });
    });
    it('should not insert duplicate user into mongo', function(done){
      var u1 = new User({email:'sue@aol.com', password:'wxyz'});
      u1.hashPassword(function(){
        u1.insert(function(){
          expect(u1._id).to.be.undefined;
          done();
        });
      });
    });
  });
/*
    describe('findById', function(){
    it('should find user by her id', function(done){
      var id = u1._id.toString();

      User.findById(id, function(user){
        expect(user.id).to.deep.equal(u1.id);
        done();
      });
    });
  });

  describe('findByEmailAndPassword', function(){
    it('should find user by email and password', function(done){
      User.findByEmailAndPassword('sue@aol.com', 'abcd', function(user){
        expect(user.email).to.equal('sue@aol.com');
        done();
      });
    });
    it('should not find user - bad email', function(done){
      User.findByEmailAndPassword('bad@aol.com', 'abcd', function(user){
        expect(user).to.be.null;
        done();
      });
    });
    it('should not find user - bad password', function(done){
      User.findByEmailAndPassword('sue@aol.com', 'wrong', function(user){
        expect(user).to.be.null;
        done();
      });
    });
  });
*/
});

