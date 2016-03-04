var CONFIG = require('./helpers/config');

var assert = require('assert');
var supertest = require('supertest');
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;
var buzzesRepository = require('../../lib/buzzes-repository.js')();

var DATABASE_URL  = process.env.DATABASE_URL;

var connect = function(callback){
  MongoClient.connect(DATABASE_URL, function(err, db){
    assert.equal(err, null);
    callback(db.collection('buzzes'));
  });
};

describe('buzzesRepository', function() {
  var buzz;
  var collection;

  before(function(done) {
    buzz = {
      content: 'This is a test',
      local: 'São Paulo (SP)',
      author: 'test',
      timestamp: CONFIG.FORMATTED_TIMESTAMP,
      type: 'text'
    };
    done();
  });

  describe('deleteById', function(done) {

    var newBuzz;

    before(function(done) {
      var insertOne = function(collection){
        collection.insertOne(buzz, function(err, result) {
          newBuzz = result.ops[0];
          done();
        });
      };

      connect(insertOne);
    });

    it('deletes', function(done) {
      buzzesRepository.deleteById(newBuzz._id, function() {});

      var findById = function(collection){
        collection.find({_id: newBuzz._id}, function(err, item) {
          assert.equal(err, null);
          done(err);
        });
      }

      connect(findById);
    });
  })
});
