/* global $, io */

$(function() {
  var socket = io();

  socket.on('buzz', function (data) {
    console.log(data);
  });
});
