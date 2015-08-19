'use strict';

var MongoClient = require('mongodb').MongoClient;
var ObjectId    = require('mongodb').ObjectID;
var assert      = require('assert');

var DATABASE_URL    = process.env.DATABASE_URL;

module.exports = function() {

  return {
      insertBuzz: function(newBuzz, callback) {
        MongoClient.connect(DATABASE_URL, function(err, db) {
            assert.equal(null, err);
            newBuzz.date = new Date();
            db.collection('buzzes').insertOne(newBuzz, function(err, result) {
                assert.equal(err, null);
                callback(result);
            });
        });
      },

      allBuzzes: function(callback) {
        MongoClient.connect(DATABASE_URL, function(err, db) {
          var cursor = db.collection('buzzes').find().sort({'date': -1});
          var result = [];
          cursor.each(function(err, doc) {
              assert.equal(err, null);
              if (doc != null) {
                  result.push(doc);
              } else {
                  callback(result);
              }
          });
        });
      }
  };
}
