$(function() {
  var socket = io();

  socket.on('burburinho', function (data) {
    console.log(data);
  });
});
