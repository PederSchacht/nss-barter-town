'use strict';

process.env.DBNAME = 'barter-town-test';
var expect = require('chai').expect;
var Mongo = require('mongodb');
var Item, User;
var sue, bob;
var items;

describe('Item', function(){

  before(function(done){
    var initMongo = require('../../app/lib/init-mongo');
    initMongo.db(function(){
      Item = require('../../app/models/item');
      User = require('../../app/models/user');
      items = global.nss.db.collection('items');
      done();
    });
  });

  beforeEach(function(done){
    global.nss.db.dropDatabase(function(err, result){
      bob = new User({email:'bob@aol.com', password:'1234'});
      sue = new User({email:'sue@aol.com', password:'abcd'});
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

});

