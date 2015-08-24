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

exports.startServer = function() {
    app.use(cors());
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json());
    app.use(compression());
    app.use('/api', router);
    app.use(express.static(__dirname + '/../public'));

    router.get('/buzzes', function(req, res) {
        buzzesRepository.allBuzzes(function(result) {
            res.json(result);
        });
    });

    router.post('/buzzes', simpleAuth(process.env.EDITOR_USERNAME, process.env.EDITOR_PASSWORD), function(req, res) {
        buzzesRepository.insertBuzz(req.body, function(buzzId) {
            res.statusCode = 201;
            res.send({id: buzzId});
            res.end();

            io.emit('buzz', {
                message: req.body
            });
        });
    });

    router.get('/drafts', simpleAuth(process.env.COLLABORATOR_USERNAME, process.env.COLLABORATOR_PASSWORD), function(req, res) {
        draftsRepository.allDrafts(function(result) {
            res.json(result);
        });
    });

    router.post('/drafts', simpleAuth(process.env.COLLABORATOR_USERNAME, process.env.COLLABORATOR_PASSWORD), function(req, res) {
        draftsRepository.insertDraft(req.body, function(draftId) {
            res.statusCode = 201;
            res.send({id: draftId});
            res.end();

            io.emit('draft', {
                message: req.body
            });
        });
    });

    router.delete('/drafts/:id', simpleAuth(process.env.EDITOR_USERNAME, process.env.EDITOR_PASSWORD), function(req, res) {
        draftsRepository.deleteById(req.params.id, function(result) {
           res.statusCode = 204;
           res.end();
        });
    });

    router.put('/drafts/:id', simpleAuth(process.env.EDITOR_USERNAME, process.env.EDITOR_PASSWORD), function(req, res) {
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
