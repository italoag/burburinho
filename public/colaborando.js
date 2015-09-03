/* global $, alert, moment */

  function sendMessage (buzz) {
    if (buzz.type === 'gallery') {
      buzz.content = JSON.parse(buzz.content);
    }
    $.post( '/api/drafts', buzz, function(){
      createAlertMessage('Sugestão enviada para redator');
    });
  }

  function addBuzz(){
    var local     = $('input.local').val();
    var author     = $('input.author').val();
    var timestamp = moment().format('YYYY-MM-DD HH:mm:ss');
    var content   = $('textarea.text').val();
    var video      = $('input.video').val();
    var photo      = $('input.photo').val();
    var type = $('#type').val();
    var id = (new Date()).getTime();
    var buzz = {
      local: local,
      timestamp: timestamp,
      author: author,
      type: type
    };

    if( type === 'video' ){
      buzz.url = '//www.youtube.com/embed/' + getYoutubeId(video);
    }else if( type === 'photo' ||  type === 'quote'){
      buzz.url = photo;
    } else if (type === 'gallery') {
      buzz.content = galleryListItems;
    }

    if(content !== ''){
      buzz.content = content;
    }

    sendMessage(buzz);

    $('input.local, textarea.text, input.video, input.photo').val('');
    $('.element.photo.preview').attr('src', '//farm1.staticflickr.com/695/20543448415_4efb795e63_b.jpg');
  }

  $(window).load(function(){
    if( window.UA.isMobile() ) {
      $('input.form-control, select.form-control, textarea.form-control').addClass('input-lg');
      $('.go').addClass('btn-lg btn-block');
      $('#type option[value="video"]').remove();
    }
  });
