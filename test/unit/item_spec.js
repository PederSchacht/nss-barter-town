'use strict';

process.env.DBNAME = 'barter-town-test';
var expect = require('chai').expect;
var Mongo = require('mongodb');
var Item;

describe('Item', function(){

  before(function(done){
    var initMongo = require('../../app/lib/init-mongo');
    initMongo.db(function(){
      Item = require('../../app/models/item');
      done();
    });
  });

  beforeEach(function(done){
    global.nss.db.dropDatabase(function(err, result){
      done();
    });
  });

  describe('new', function(){
    it('should create a new Item object', function(){
      var item = new Item({name:'Ford Mustang', year:'1967', desc:'Fast Classic Car', cost:'15000', tags:['car', 'red'], avaliability:'Avaliable'});
      expect(item).to.be.instanceof(Item);
      expect(item.name).to.equal('Ford Mustang');
      expect(item.year).to.equal('1967');
      expect(item.desc).to.equal('Fast Classic Car');
      expect(item.cost).to.equal('15000');
      expect(item.tags).to.have.length(2);
      expect(item.avaliability).to.equal('Avaliable');
    });
  });

  describe('#insert', function(){
    it('should add item to the database', function(done){
      var item = new Item({name:'Ford Mustang', year:'1967', desc:'Fast Classic Car', cost:'15000', tags:['car', 'red'], status:'Avaliable'});
      item.insert(function(){
        expect(item._id).to.be.instanceof(Mongo.ObjectID);
        done();
      });
      
    });
  });

  describe('#destroy', function(){
    it('should remove from the database', function(done){
      var item1 = new Item({name:'Ford Mustang', year:'1967', desc:'Fast Classic Car', cost:'15000', tags:['car', 'red'], status:'Avaliable'});
      item1.insert(function(){
        var itemID = (item1._id).toString();
        Item.destroy(itemID, function(count){
          expect(count).to.equal(1);
          done();
        });
      });
    });
  });

  describe('#changeAvail', function(){
    it('should change the availability', function(done){
      var item1 = new Item({name:'Ford Mustang', year:'1967', desc:'Fast Classic Car', cost:'15000', tags:['car', 'red'], status:'Avaliable'});
      item1.insert(function(){
        item1.changeAvail();
        expect(item1.availability).to.equal('Offered');
        done();
      });
    });
  });


});




















