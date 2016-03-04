'use strict';

var MongoClient = require('mongodb').MongoClient;
var ObjectId    = require('mongodb').ObjectId;
var assert = require('assert');

var DATABASE_URL    = process.env.COBERTURA_DATABASE_URL;

var log = function(action, err) {
  var name = 'draftsrespository';
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
    callback(db.collection('drafts'));
  });
};

module.exports = function() {

  return {
      insertDraft: function(newDraft, callback) {

        newDraft.date = new Date();

        connect(function(collection){
            collection.insertOne(newDraft, function(err, result) {
                log('insertDraft', err);

                callback(result.ops[0]._id);
            });
        });
      },

      updateDraft: function(draft, callback) {
        connect(function(collection){
            var draftId = ObjectId(draft._id);
            delete draft._id;

            collection.updateOne({_id: draftId}, { $set: draft}, function(err, result) {
                log('updateDraft', err);

                assert.equal(err, null);
                callback();
            });
        });
      },

      allDrafts: function(callback) {
        connect(function(collection){
          var cursor = collection.find().sort({'date': -1});

          var result = [];
          cursor.each(function(err, doc) {
            log('allDrafts', err);

            if (doc != null) {
              result.push(doc);
            } else {
              callback(result);
            }
          });
        });
      },

      deleteById: function(draftId, callback) {
        connect(function(collection){
          collection.remove({'_id': ObjectId(draftId)}, function(err, result) {
            log('deleteById', err);

            callback(result);
          });
        });
      }
  };
};
