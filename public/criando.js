$(function() {
  var socket = io();

  function sendMessage () {
    var local     = $('#burb .local').val();
    var timestamp = moment().format('YYYY-MM-DD hh:mm:ss');
    var content   = $('#burb .text').val();

    var message = {
      local: local,
      timestamp: timestamp,
      content: content,
      type: 'text'
    };

    socket.emit('burburinho',message);
  }

  $('#type').on('change', function(e){
    var type = $(this).val();


    $('.type').hide();
    $('#'+type).show();
  });

  $('.go').click(function(){
    sendMessage();
  });

  $('.type').hide();
});
