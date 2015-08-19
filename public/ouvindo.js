/* global $, io */

$(function() {
  var socket = io();

  socket.on('buzzes', function (data) {
    console.log(data);
  });
});
