var express     = require('express');
var compression = require('compression');
var bodyParser  = require('body-parser');

var simpleAuth          = require('./simple-auth');
var buzzesRepository    = require('./buzzes-repository')();
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

    router.get('/burburinhos', function(req, res) {
        buzzesRepository.allBuzzes(function(result) {
            res.json(result);
        });
    });

    router.post('/burburinhos', simpleAuth(), function(req, res) {
        buzzesRepository.insertBuzz(req.body, function() {
            res.statusCode = 201;
            res.end();

            io.emit('burburinho', {
                message: req.body
            });
        });
    });

    server.listen(PORT, function () {
        console.log('Server listening at port %d', PORT);
    });
}
