/* global $ */

  function sendMessage (buzz) {
    if (buzz.type === 'gallery') {
      buzz.content = JSON.parse(buzz.content);
    }
    $.post( '/api/drafts', buzz, function(){
      createAlertMessage('Sugestão enviada para redator');
    });
  }

  $(window).load(function(){
    if( window.UA.isMobile() ) {
      $('input.form-control, select.form-control, textarea.form-control').addClass('input-lg');
      $('.go').addClass('btn-lg btn-block');
      $('#type option[value="video"]').remove();
    }
  });
