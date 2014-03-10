'use strict';

process.env.DBNAME = 'barter-town-test';
var expect = require('chai').expect;
var Mongo = require('mongodb');
var Item, User;
var sue, bob;
var items;
var users;
var fs = require('fs');
var exec = require('child_process').exec;

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
    var testdir = __dirname + '/../../app/static/img/barter';
    var cmd = 'rm -rf ' + testdir;
    exec(cmd, function(){
      var origfile1 = __dirname + '/../fixtures/mustang.jpg';
      var origfile2 = __dirname + '/../fixtures/mustang2.jpg';
      var copyfile1 = __dirname + '/../fixtures/mustang-copy.jpg';
      var copy2file1 = __dirname + '/../fixtures/mustang-copy2.jpg';
      var copyfile2 = __dirname + '/../fixtures/mustang2-copy.jpg';
      var copy2file2 = __dirname + '/../fixtures/mustang2-copy2.jpg';
      fs.createReadStream(origfile1).pipe(fs.createWriteStream(copyfile1));
      fs.createReadStream(origfile1).pipe(fs.createWriteStream(copy2file1));
      fs.createReadStream(origfile2).pipe(fs.createWriteStream(copyfile2));
      fs.createReadStream(origfile2).pipe(fs.createWriteStream(copy2file2));

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
      users.findOne({name: 'Sue'}, function(err, record){
        var userId1 = record._id.toString();
        item1.addUser(userId1);
        item1.insert(function(records1){
          users.findOne({name: 'Bob'}, function(err, record2){
            var userId2 = record2._id.toString();
            item2.addUser(userId2);
            item2.insert(function(records2){
              var bids = [{itemId: item1._id.toString(), userId: userId1}, {itemId: item2._id.toString(), userId: userId2}];
              item3.addBids(bids);
              expect(item3.bids).to.deep.equal(bids);
              done();
            });
          });
        });
      });
    });
  });

  describe('#removeBidsByUser', function(){
    it('should remove bids by a specified user from the item', function(done){
      var item1 = new Item({name:'Ford Mustang', year:'1967', desc:'Fast Classic Car', cost:'15000', tags:['car', 'red'], status:'Available'});
      var item2 = new Item({name:'Used Socks', year:'1981', desc:'My nasty-ass gym socks', cost:'100', tags:['foot apparell', 'smells'], status:'Available'});
      var item3 = new Item({name:'Van Halen Cassette', year:'1984', desc:'Heavily worn-out cassete.', cost:'200', tags:['80s rock', 'smells'], status:'Available'});
      users.findOne({name: 'Sue'}, function(err, record){
        var userId1 = record._id.toString();
        item1.addUser(userId1);
        item1.insert(function(records1){
          users.findOne({name: 'Bob'}, function(err, record2){
            var userId2 = record2._id.toString();
            item2.addUser(userId2);
            item2.insert(function(records2){
              var bids = [{itemId: item1._id.toString(), userId: item1.userId}, {itemId: item2._id.toString(), userId: item2.userId}];
              item3.addBids(bids);
              item3.removeBidsByUser(userId2);
              expect(item3.bids).to.deep.equal([{itemId: item1._id.toString(), userId: userId1}]);
              done();
            });
          });
        });
      });
    });
  });

  describe('findById', function(){
    it('should find an item by its Id.', function(done){
      var item1 = new Item({name:'Ford Mustang', year:'1967', desc:'Fast Classic Car', cost:'15000', tags:['car', 'red'], status:'Available'});
      var item2 = new Item({name:'Used Socks', year:'1981', desc:'My nasty-ass gym socks', cost:'100', tags:['foot apparell', 'smells'], status:'Available'});
      var item3 = new Item({name:'Van Halen Cassette', year:'1984', desc:'Heavily worn-out cassete.', cost:'200', tags:['80s rock', 'smells'], status:'Available'});
      item1.insert(function(){
        item2.insert(function(){
          item3.insert(function(){
            Item.findById(item1._id.toString(), function(record){
              expect(record.name).to.equal('Ford Mustang');
              done();
            });
          });
        });
      });
    });
  });

  describe('findAll', function(){
    it('should find all items.', function(done){
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

  describe('findByTag', function(){
    it('should find items with a given tag.', function(done){
      var item1 = new Item({name:'Ford Mustang', year:'1967', desc:'Fast Classic Car', cost:'15000', tags:['car', 'red'], status:'Available'});
      var item2 = new Item({name:'Used Socks', year:'1981', desc:'My nasty-ass gym socks', cost:'100', tags:['foot apparell', 'smells'], status:'Available'});
      var item3 = new Item({name:'Van Halen Cassette', year:'1984', desc:'Heavily worn-out cassete.', cost:'200', tags:['80s rock', 'smells'], status:'Available'});
      item1.insert(function(){
        item2.insert(function(){
          item3.insert(function(){
            Item.findByTag('smells', function(records){
              expect(records.length).to.equal(2);
              done();
            });
          });
        });
      });
    });
  });

  describe('findByYear', function(){
    it('should find items with a given year.', function(done){
      var item1 = new Item({name:'Ford Mustang', year:'1967', desc:'Fast Classic Car', cost:'15000', tags:['car', 'red'], status:'Available'});
      var item2 = new Item({name:'Used Socks', year:'1984', desc:'My nasty-ass gym socks', cost:'100', tags:['foot apparell', 'smells'], status:'Available'});
      var item3 = new Item({name:'Van Halen Cassette', year:'1984', desc:'Heavily worn-out cassete.', cost:'200', tags:['80s rock', 'smells'], status:'Available'});
      item1.insert(function(){
        item2.insert(function(){
          item3.insert(function(){
            Item.findByYear('1984', function(records){
              expect(records.length).to.equal(2);
              done();
            });
          });
        });
      });
    });
  });

  describe('findByUser', function(){
    it('should find items with a given user.', function(done){
      var item1 = new Item({name:'Ford Mustang', year:'1967', desc:'Fast Classic Car', cost:'15000', tags:['car', 'red'], status:'Available'});
      var item2 = new Item({name:'Used Socks', year:'1984', desc:'My nasty-ass gym socks', cost:'100', tags:['foot apparell', 'smells'], status:'Available'});
      var item3 = new Item({name:'Van Halen Cassette', year:'1984', desc:'Heavily worn-out cassete.', cost:'200', tags:['80s rock', 'smells'], status:'Available'});

      users.findOne({name: 'Bob'}, function(err, record){
        var userId = record._id.toString();
        item1.addUser(userId);
        item1.insert(function(){
          item2.insert(function(){
            item3.insert(function(){
              Item.findByUser(userId, function(records){
                expect(records[0].name).to.equal('Ford Mustang');
                done();
              });
            });
          });
        });
      });
    });
  });

  describe('findByName', function(){
    it('should find items with a given name.', function(done){
      var item1 = new Item({name:'Ford Mustang', year:'1967', desc:'Fast Classic Car', cost:'15000', tags:['car', 'red'], status:'Available'});
      var item2 = new Item({name:'Used Socks', year:'1984', desc:'My nasty-ass gym socks', cost:'100', tags:['foot apparell', 'smells'], status:'Available'});
      var item3 = new Item({name:'Ford Mustang', year:'1984', desc:'Heavily worn-out cassete.', cost:'200', tags:['80s rock', 'smells'], status:'Available'});
      item1.insert(function(){
        item2.insert(function(){
          item3.insert(function(){
            Item.findByName('Ford Mustang', function(records){
              expect(records.length).to.equal(2);
              done();
            });
          });
        });
      });
    });
  });

  describe('addPhoto', function(){
    it('should add a photo to the items photos array.', function(done){
      var oldname1 = __dirname + '/../fixtures/mustang-copy.jpg';
      var oldname2 = __dirname + '/../fixtures/mustang2-copy.jpg';
      var item = new Item({name:'Ford Mustang', year:'1967', desc:'Fast Classic Car', cost:'15000', tags:['car', 'red'], status:'Available'});
      users.findOne({name: 'Sue'}, function(err, record){
        var userId1 = record._id.toString();
        item.addUser(userId1);
        item.addPhoto(oldname1, function(){
          item.addPhoto(oldname2, function(){
            expect(item.photos).to.deep.equal(['/img/barter/fordmustang/1967/0.jpg', '/img/barter/fordmustang/1967/1.jpg']);
            done();
          });
        });
      });
    });
  });
});

