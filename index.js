var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 5000;
var buzz = [];

var router = express.Router();

router.get('/burburinhos', function(req, res) {
  res.json(buzz);
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
