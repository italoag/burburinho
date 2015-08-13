var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 5000;
var buzz = [];

var router = express.Router();

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

router.get('/burburinhos', function(req, res) {
  res.json(buzz);
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

app.use('/api', router);


server.listen(port, function () {
  console.log('Server listening at port %d', port);
});

app.use(express.static(__dirname + '/public'));


io.on('connection', function (socket) {

  socket.on('burburinho', function (data) {
    buzz.push(data);

    socket.broadcast.emit('burburinho', {
      message: data
    });
  });
});
