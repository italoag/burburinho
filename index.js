var express = require('express');
var compression = require('compression');
var auth = require('basic-auth');
var bodyParser = require('body-parser');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 5000;
var buzz = [];

var USERNAME = process.env.USERNAME;
var PASSWORD = process.env.PASSWORD;

var router = express.Router();

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

router.get('/burburinhos', function(req, res) {
  res.json(buzz);
});

router.post('/burburinhos', function(req, res) {
  var credentials = auth(req);

  if (!credentials || credentials.name !== USERNAME || credentials.pass !== PASSWORD) {
    res.statusCode = 401;
    res.setHeader('WWW-Authenticate', 'Basic realm="example"');
    res.end('Access denied');
  } else {
    buzz.push(req.body);
    res.statusCode = 201;
    res.end();

    io.emit('burburinho', {
        message: req.body
    });
  }
});

router.get('/test', function(req, res) {
  var result = [];

  for(var i = 0;i < 100;i++){
    buzz.forEach(function(e){
      result.push(e);
    });
  }

  res.json(result);
});

app.use(compression());
app.use('/api', router);


server.listen(port, function () {
  console.log('Server listening at port %d', port);
});

app.use(express.static(__dirname + '/public'));
