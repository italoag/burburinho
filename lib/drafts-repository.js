'use strict';

var MongoClient = require('mongodb').MongoClient;
var ObjectId    = require('mongodb').ObjectID;
var assert = require('assert');

var DATABASE_URL    = process.env.DATABASE_URL;

var connect = function(callback){
  MongoClient.connect(DATABASE_URL, function(err, db){
    assert.equal(err, null);
    callback(db.collection('drafts'));
  });
};

module.exports = function() {

  return {
      insertDraft: function(newDraft, callback) {

        newDraft.date = new Date();

        connect(function(collection){
            collection.insertOne(newDraft, function(err, result) {
                callback(result);
            });
        });
      },

      allDrafts: function(callback) {
        connect(function(collection){
          var cursor = collection.find().sort({'date': -1});

          var result = [];
          cursor.each(function(err, doc) {
            if (doc != null) {
              result.push(doc);
            } else {
              callback(result);
            }
          });
        });
      }
  };
};
