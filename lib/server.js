var express     = require('express');
var compression = require('compression');
var bodyParser  = require('body-parser');

var simpleAuth          = require('./simple-auth');
var buzzesRepository    = require('./buzzes-repository')();
var draftsRepository    = require('./drafts-repository')();
var cors                = require('./cors');

var app = express();

var server      = require('http').createServer(app);
var io          = require('socket.io')(server);
var PORT        = process.env.PORT || 5000;

var router = express.Router();


var EDITOR = {username: process.env.EDITOR_USERNAME, password: process.env.EDITOR_PASSWORD};
var COLLABORATOR = {username: process.env.COLLABORATOR_USERNAME, password: process.env.COLLABORATOR_PASSWORD};

exports.startServer = function() {
    app.use(cors());
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json());
    app.use(compression());
    app.use('/api', router);
    app.use(express.static(__dirname + '/../public'));

    router.get('/buzzes', function(req, res) {
        buzzesRepository.allBuzzes(function(result) {
            res.statusCode = 200;
            res.json(result);
        });
    });

    router.get('/buzzes/:id', function(req, res) {
      req.body._id = req.params.id;
      buzzesRepository.findById(req.params.id, function(result) {
          res.statusCode = 200;
          res.json(result);
      });
    });

    router.post('/buzzes', simpleAuth([EDITOR]), function(req, res) {
        buzzesRepository.insertBuzz(req.body, function(buzzId) {
            res.statusCode = 201;
            res.send({id: buzzId});
            res.end();

            io.emit('buzz', {
                message: req.body
            });
        });
    });

    router.put('/buzzes/:id', simpleAuth([EDITOR]), function(req, res) {
        req.body._id = req.params.id;
        var buzzId = req.params.id;

        buzzesRepository.updateBuzz(req.body, function() {
            res.statusCode = 204;

            buzzesRepository.findById(buzzId, function(result) {
              io.emit('updated:buzz', {
                message: result
              });

              res.end();
            });
        });
    });

    router.get('/drafts', simpleAuth([EDITOR]), function(req, res) {
        draftsRepository.allDrafts(function(result) {
            res.statusCode = 200;
            res.json(result);
        });
    });

    router.post('/drafts', simpleAuth([EDITOR, COLLABORATOR]), function(req, res) {
        draftsRepository.insertDraft(req.body, function(draftId) {
            res.statusCode = 201;
            res.send({id: draftId});
            res.end();

            io.emit('draft', {
                message: req.body
            });
        });
    });

    router.delete('/drafts/:id', simpleAuth([EDITOR]), function(req, res) {
        draftsRepository.deleteById(req.params.id, function(result) {
           res.statusCode = 204;
           res.end();
        });
    });

    router.put('/drafts/:id', simpleAuth([EDITOR]), function(req, res) {
        req.body._id = req.params.id;
        draftsRepository.updateDraft(req.body, function() {
            res.statusCode = 204;
            res.end();
        });
    });

    server.listen(PORT, function () {
        console.log('Server listening at port %d', PORT);
    });
};
