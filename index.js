var express     = require('express');
var compression = require('compression');
var MongoClient = require('mongodb').MongoClient;
var ObjectId    = require('mongodb').ObjectID;
var assert      = require('assert');
var bodyParser  = require('body-parser');

var simpleAuth = require('./simple-auth');

var app = express();

var server      = require('http').createServer(app);
var io          = require('socket.io')(server);

var PORT            = process.env.PORT || 5000;
var DATABASE_URL    = process.env.DATABASE_URL;

var router = express.Router();

function insertBuzz(db, newBuzz, callback) {
  newBuzz.date = new Date();
  db.collection('buzzes').insertOne(newBuzz, function(err, result) {
    assert.equal(err, null);
    callback(result);
  });
}

function allBuzzes(db, callback) {
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
}

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

router.get('/burburinhos', function(req, res) {
    MongoClient.connect(DATABASE_URL, function(err, db) {
        assert.equal(null, err);
        allBuzzes(db, function(result) {
            res.json(result);
            db.close();
        });
    });
});

router.post('/burburinhos', simpleAuth(), function(req, res) {
    MongoClient.connect(DATABASE_URL, function(err, db) {
        assert.equal(null, err);
        insertBuzz(db, req.body, function() {
            db.close();

            res.statusCode = 201;
            res.end();

            io.emit('burburinho', {
                message: req.body
            });
        });
    });
});


app.use(compression());
app.use('/api', router);


server.listen(PORT, function () {
  console.log('Server listening at port %d', PORT);
});

app.use(express.static(__dirname + '/public'));
