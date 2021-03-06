'use strict';

var MongoClient   = require('mongodb').MongoClient;
var ObjectId      = require('mongodb').ObjectId;
var assert        = require('assert');

var DATABASE_URL  = process.env.COBERTURA_DATABASE_URL;

var log = function(action, err) {
  var name = 'buzzesRepository';
  if (err) {
    console.error(name, { action: action, error: err });
  } else {
    console.info(name, { action: action });
  }
}

var connect = function(callback){
  MongoClient.connect(DATABASE_URL, function(err, db){
    log('connect', err);

    assert.equal(err, null);
    callback(db.collection('buzzes'));
  });
};

module.exports = function() {

  return {
      insertBuzz: function(newBuzz, callback) {

        newBuzz.date = new Date();
        delete newBuzz._id;

        connect(function(collection){
            collection.insertOne(newBuzz, function(err, result) {
                log('updating', err);

                callback(result.ops[0]._id);
            });
        });
      },

      updateBuzz: function(buzz, callback) {
        connect(function(collection){
            var buzzId = ObjectId(buzz._id);
            delete buzz._id;

            collection.updateOne({_id: buzzId}, { $set: buzz}, function(err, result) {
                log('updateBuzz', err);

                assert.equal(err, null);
                callback();
            });
        });
      },

      allBuzzes: function(callback) {
        connect(function(collection){
          var cursor = collection.find().sort({'date': -1});

          var result = [];
          cursor.each(function(err, doc) {
            log('allBuzzes', err);

            if (doc != null) {
              result.push(doc);
            } else {
              callback(result);
            }
          });
        });
      },
      findById: function(buzzId, callback) {
        connect(function(collection){
          collection.find({_id: ObjectId(buzzId)}).toArray( function(err, item) {
            log('findById', err);

            callback(item[0]);
          });
        });
      },
      deleteById: function(draftId, callback) {
        connect(function(collection){
          collection.remove({'_id': ObjectId(draftId)}, function(err) {
            log('deleteById', err);
            callback();
          });
        });
      }
  };
};
