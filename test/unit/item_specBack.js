'use strict';

process.env.DBNAME = 'barter-town-test';
var expect = require('chai').expect;
var Mongo = require('mongodb');
var Item, User;
var sue, bob;
var items;
var users;

describe('Item', function(){

  before(function(done){
    var initMongo = require('../../app/lib/init-mongo');
    initMongo.db(function(){
      Item = require('../../app/models/item');
      User = require('../../app/models/user');
      items = global.nss.db.collection('items');
      users = global.nss.db.collection('users');
      done();
    });
  });

  beforeEach(function(done){
    global.nss.db.dropDatabase(function(err, result){
      bob = new User({email:'bob@aol.com', password:'1234', name: 'Bob'});
      sue = new User({email:'sue@aol.com', password:'abcd', name: 'Sue'});
      sue.hashPassword(function(){
        sue.insert(function(){
          bob.hashPassword(function(){
            bob.insert(function(){
              done();
            });
          });
        });
      });
    });
  });

  describe('new', function(){
    it('should create a new Item object', function(){
      var item = new Item({name:'Ford Mustang', year:'1967', desc:'Fast Classic Car', cost:'15000', tags:['car', 'red'], status:'Available'});
      expect(item).to.be.instanceof(Item);
      expect(item.name).to.equal('Ford Mustang');
      expect(item.year).to.equal('1967');
      expect(item.desc).to.equal('Fast Classic Car');
      expect(item.cost).to.equal('15000');
      expect(item.tags).to.have.length(2);
      expect(item.status).to.equal('Available');
    });
  });
  
  describe('#addUser', function(){
    it('should add a user id to indicate who owns the item', function(done){
      var item1 = new Item({name:'Ford Mustang', year:'1967', desc:'Fast Classic Car', cost:'15000', tags:['car', 'red'], status:'Available'});
      users.findOne({name: 'Sue'}, function(err, record){
        var id = record._id.toString();
        item1.addUser(id);
        expect(item1.userId).to.equal(id);
        done();
      });
    });
  });

  describe('#insert', function(){
    it('should add item to the database', function(done){
      var item = new Item({name:'Ford Mustang', year:'1967', desc:'Fast Classic Car', cost:'15000', tags:['car', 'red'], status:'Available'});
      item.insert(function(){
        expect(item._id).to.be.instanceof(Mongo.ObjectID);
        done();
      });
    });
  });

  describe('#destroy', function(){
    it('should remove from the database', function(done){
      var item1 = new Item({name:'Ford Mustang', year:'1967', desc:'Fast Classic Car', cost:'15000', tags:['car', 'red'], status:'Available'});
      item1.insert(function(){
        var itemID = (item1._id).toString();
        Item.destroy(itemID, function(count){
          expect(count).to.equal(1);
          done();
        });
      });
    });
  });

  describe('#changeStatus', function(){
    it('should change the availability', function(done){
      var item1 = new Item({name:'Ford Mustang', year:'1967', desc:'Fast Classic Car', cost:'15000', tags:['car', 'red'], status:'Available'});
      item1.insert(function(){
        item1.changeStatus();
        expect(item1.status).to.equal('Offered');
        done();
      });
    });
  });

  describe('#findById', function(){
    it('should find an item by its id', function(done){
      var item1 = new Item({name:'Ford Mustang', year:'1967', desc:'Fast Classic Car', cost:'15000', tags:['car', 'red'], status:'Available'});
      item1.insert(function(){
        var itemID = (item1._id).toString();
        Item.findById(itemID, function(item){
          expect(item._id).to.deep.equal(item1._id);
          done();
        });
      });
    });
  });

  describe('#update', function(){
    it('should update the item in the database', function(done){
      var item1 = new Item({name:'Ford Mustang', year:'1967', desc:'Fast Classic Car', cost:'15000', tags:['car', 'red'], status:'Available'});
      item1.insert(function(){
        item1.changeStatus();
        item1.update(function(result){
          items.findOne({_id: item1._id}, function(err, record){
            expect(item1.status).to.equal(record.status);
            done();
          });
        });
      });
    });
  });

  describe('findAll', function(){
    it('should find all items', function(done){
      var item1 = new Item({name:'Ford Mustang', year:'1967', desc:'Fast Classic Car', cost:'15000', tags:['car', 'red'], status:'Available'});
      var item2 = new Item({name:'Used Socks', year:'1981', desc:'My nasty-ass gym socks', cost:'100', tags:['foot apparell', 'smells'], status:'Available'});
      var item3 = new Item({name:'Van Halen Cassette', year:'1984', desc:'Heavily worn-out cassete.', cost:'200', tags:['80s rock', 'smells'], status:'Available'});
      item1.insert(function(){
        item2.insert(function(){
          item3.insert(function(){
            Item.findAll(function(records){
              expect(records.length).to.equal(3);
              done();
            });
          });
        });
      });
    });
  });

  describe('#addBids', function(){
    it('should add things that are bidded in exchange for the item', function(done){
      var item1 = new Item({name:'Ford Mustang', year:'1967', desc:'Fast Classic Car', cost:'15000', tags:['car', 'red'], status:'Available'});
      var item2 = new Item({name:'Used Socks', year:'1981', desc:'My nasty-ass gym socks', cost:'100', tags:['foot apparell', 'smells'], status:'Available'});
      var item3 = new Item({name:'Van Halen Cassette', year:'1984', desc:'Heavily worn-out cassete.', cost:'200', tags:['80s rock', 'smells'], status:'Available'});
      item1.insert(function(records1){
        item2.insert(function(records2){
          var ids = [item1._id.toString(), item2._id.toString()];
          item3.addBids(ids);
          expect(item3.bids).to.deep.equal(ids);
          done();
        });
      });
    });
  });

/*
  describe('#removeBids', function(){
    it('should remove bids by a specified user from the item', function(done){
      var item1 = new Item({name:'Ford Mustang', year:'1967', desc:'Fast Classic Car', cost:'15000', tags:['car', 'red'], status:'Available'});
      var item2 = new Item({name:'Used Socks', year:'1981', desc:'My nasty-ass gym socks', cost:'100', tags:['foot apparell', 'smells'], status:'Available'});
      var item3 = new Item({name:'Van Halen Cassette', year:'1984', desc:'Heavily worn-out cassete.', cost:'200', tags:['80s rock', 'smells'], status:'Available'});
      users.findOne({name: 'Sue'}, function(err, record){
        var id1 = record._id.toString();
        item1.addUser(id1);
        item1.insert(function(records1){
          users.findOne({name: 'Bob'}, function(err, record2){
            var id2 = record2._id.toString();
            item2.addUser(id2);
            item2.insert(function(records2){
              var ids = [item1._id.toString(), item2._id.toString()];
              item3.addBids(ids);
              item3.removeBids(id2);
              expect(item3.bids).to.deep.equal([item1._id.toString()]);
              done();
            });
          });
        });
      });
    });
  });
*/


});

