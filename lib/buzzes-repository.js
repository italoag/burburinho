'use strict';

var MongoClient = require('mongodb').MongoClient;
var ObjectId    = require('mongodb').ObjectID;

var DATABASE_URL    = process.env.DATABASE_URL;


var connect = function(callback){
  MongoClient.connect(DATABASE_URL, function(err, db){
    assert.equal(err, null);
    callback(db.collection('buzzes'));
  });
};

module.exports = function() {

  return {
      insertBuzz: function(newBuzz, callback) {

        newBuzz.date = new Date();

        connect(function(collection){
            collection.insertOne(newBuzz, function(err, result) {
                callback(result);
            });
        });
      },

      allBuzzes: function(callback) {
        connect(function(collection){
          var cursor = collection.find().sort({'date': -1});

          var result = [];
          cursor.each(function(err, doc) {
            if (doc != null) {
              result.push(doc);
            }
          });

          callback(result);
        });
      }
  };
}