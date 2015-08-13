$(function() {
  var socket = io();
  var buzzs = [];
  var typeAndInputs = {
    'text': ['.local','.text'],
    'video': ['.local','.text','.video'],
    'quote': ['.local','.photo','.text'],
    'photo': ['.local','.photo','.text'],
    'gallery': ['.local','.photos']
  };


  function getYoutubeId(url){
    var regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    var match = url.match(regExp);

    if (match && match[2].length == 11) {
      return match[2];
    }else{
      alert('Url incorreta');
    }
  }

  function sendMessage (buzz) {
    socket.emit('burburinho', buzz);
  }

  function addBuzz(){
    var local     = $('input.local').val();
    var timestamp = moment().format('YYYY-MM-DD HH:mm:ss');
    var content   = $('textarea.text').val();
    var video      = $('input.video').val();
    var photo      = $('input.photo').val();
    var type = $('#type').val();
    var id = (new Date()).getTime();
    var buzz = {
      local: local,
      timestamp: timestamp,
      type: type
    };

    if( type === 'video' ){
      buzz['url'] = '//www.youtube.com/embed/'+getYoutubeId(video);
    }else if( type === 'photo' ||  type === 'quote'){
      buzz['url'] = photo;
    }

    if(content !== ''){
      buzz['content'] = content;
    }

    buzzs.push(buzz);
    updateBuzzList(buzz);
  }

  function getLabelOfType(type){
    var result = 'Texto';

    if( type === 'video') {
      result = 'Video';
    } else if( type === 'quote') {
      result = 'Aspas';
    } else if( type === 'photo') {
      result = 'Foto comentada';
    } else if( type === 'gallery') {
      result = 'Galleria de imagens';
    }
    return result;
  }

  function updateBuzzList(buzz){
    var list = $('aside .list-buzz');
    var div = $('<div/>', { class: 'buzz', id:buzz.id, 'data-buzz': JSON.stringify(buzz) });

    div.append(
        $('<h2/>',{ text: getLabelOfType(buzz.type) }),
        $('<time>'+buzz.timestamp +'</time>'),
        $('<p>'+buzz.content+'</p>'),
        $('<span>'+buzz.local+'</span>'),
        $('<button/>',{
            text: 'Enviar',
            click: function(){
              sendMessage(buzz);
            }
        })
    );

    list.append(div);
  }

  $('#type').on('change', function(e){
    var type = $(this).val();

    if(type !== ''){
      var inputs = typeAndInputs[type];
      $('.element').hide();
      var previewImage = $('img.preview').data('src');
      $('img.preview').attr('src',previewImage);

      inputs.forEach(function(e){
        $(e).show();
      });

      $('.type').show();
    }
  });

  $('.go').click(function(){
    addBuzz();
  });

  $('div.element.photo').uploadFile({
    url:'//file-service.herokuapp.com/upload',
    multiple:false,
    dragDrop:true,
    sequential:true,
    sequentialCount:1
    acceptFiles:'image/*',
    fileName:'myfile',
    showPreview:false,
    showStatusAfterSuccess: false,
    onSubmit:function(files)
    {
      $('div.element.photo').hide();
    },
    onSuccess:function(files,data,xhr,pd)
    {
      var url = data['link'];

      $('img.preview').attr('src', url);
      $('input.element.photo').val(url);
    },
  });

  $('.type').hide();
});
