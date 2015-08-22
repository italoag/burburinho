/* global $, alert, moment */
var buzzs = [];
var drafts = [];
var galleryListItems = [];
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

    if (match && match[2].length === 11) {
        return match[2];
    }else{
        alert('Url incorreta');
    }
}

function sendMessage (buzz) {
    if (buzz.type === 'gallery') {
        buzz.content = JSON.parse(buzz.content);
    }
    $.post( '/api/buzzes', buzz);
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
        buzz.url = '//www.youtube.com/embed/' + getYoutubeId(video);
    }else if( type === 'photo' ||  type === 'quote'){
        buzz.url = photo;
    } else if (type === 'gallery') {
        buzz.content = galleryListItems;
    }

    if(content !== ''){
        buzz.content = content;
    }

    buzzs.push(buzz);
    updateBuzzList(buzz);

    $('input.local, textarea.text, input.video, input.photo').val('');
    $('#type').trigger('change');
    $('.element.photo.preview').attr('src', 'http://farm1.staticflickr.com/695/20543448415_4efb795e63_b.jpg');
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

function createAlertMessage(message) {
    $('.list-messages').html('').html(
            '<div class="alert alert-success" role="alert">' +
            '<button type="button" class="close" data-dismiss="alert" aria-label="Close">' +
            '<span aria-hidden="true">&times;</span>' +
            '</button>' +
            message +
            '</div>');
    setTimeout(function(){
        $('.alert.alert-success').fadeOut().remove();
    }, 5000);
}

function updateBuzzList(buzz){

    if (buzz.type === 'gallery') {
        var jsonContent = [];
        var galleryContentItems = $('<ul>' + buzz.content.map(function(item) {
            jsonContent.push('{"url": "' + item.url + '", "description": "' + item.description + '"}');
            return  '<li>' + item.url + '</li>';
        }) + '</ul>');

        buzz.content = '[' + jsonContent.join(',') + ']';
    } else {
        galleryContentItems = $('<p>'+buzz.content+'</p>');
    }

    var list = $('aside .list-buzz');
    var div = $('<div/>', { class: 'buzz', id:buzz.id, 'data-buzz': JSON.stringify(buzz) });

    if($('.to-remove')[0]) {
        $('.to-remove').remove();
    }

    var date = buzz.timestamp.split(' ')[0].split('-', 3);
    date.shift();
    date.reverse();

    $('table tbody').append(
            '<tr>' +
            '<td>' + getLabelOfType(buzz.type) + '</td>' +
            '<td>' + date.join('/') + '</td>' +
            '<td>' + galleryContentItems.html() + '</td>' +
            '<td>' + buzz.local + '</td>' +
            '<td>' +
            '<button data-buzz-id="' + (buzzs.length - 1) +
            '" type="button" class="btn btn-outlined btn-theme btn-lg publish-message" >Publicar</button>' +
            '</td>' +
            '</tr>'
            );

    list.append(div);
    createAlertMessage('Conteúdo inserido na lista de rascunhos e aguardando confirmação de envio');
}

$('body').on('click', '.publish-message', function() {
    var buzzId = $(this).data('buzz-id');
    sendMessage(buzzs[buzzId]);
    $('button[data-buzz-id="' + buzzId + '"]').parents('tr').remove();
    if ( !$('.publish-list tbody tr')[0]) {
        $('.publish-list tbody').append('<tr class="to-remove">' +
            '<td colspan="5">Nenhum burburinho cadastrado</th>' +
            '</tr>');
    }
    createAlertMessage('Conteúdo enviado para a timeline');
})
.on('click', '.publish-draft-message', function() {
    var draftId = $(this).data('draft-id');
    var draft = drafts[draftId];

    console.log(draft);
    $.ajax({
      url: '/api/drafts/' + draft._id,
      type: 'DELETE',
      success: function(result) {
        sendMessage(draft);
        $('button[data-draft-id="' + draftId + '"]').parents('tr').remove();
        if ( !$('.draft-list tbody tr')[0]) {
            $('.draft-list tbody').append('<tr class="to-remove">' +
                '<td colspan="5">Nenhum rascunho cadastrado</th>' +
                '</tr>');
        }
        createAlertMessage('Conteúdo enviado para a timeline');

      }
    });
});

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

        if (type === 'gallery') {
            $('.multiple-image').show();
            $('.single-image').hide();
        } else {
            $('.multiple-image').hide();
            $('.multiple-image .preview').remove();
            galleryListItems = [];
            $('.single-image').show();
        }

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
	        var url = data.link;

	        $('img.preview').attr('src', url);
	        $('input.element.photo').val(url);
	    },
    });

    $('.photos.multiple').uploadFile({
	    url:'//file-service.herokuapp.com/upload',
	    multiple:true,
	    dragDrop:true,
	    sequential:true,
	    sequentialCount:1,
	    acceptFiles:'image/*',
	    fileName:'myfile',
	    showPreview:false,
	    showStatusAfterSuccess: false,
	    onSubmit:function(files)
	    {
	        $('div.element.photo.multiple').hide();
	    },
	    onSuccess:function(files, data, xhr, pd)
	    {
	        galleryListItems.push({
	            url: data.link,
	            description: 'This is a test'
            });
            var newImage = '<img class="element photo preview" src="' + data.link + '"/>';
            $('.multiple-image').prepend(newImage);
        },
    });

$('.type, .multiple-image').hide();

function getSocketIOUrl(){
  return window.location.origin.indexOf('localhost') === -1 ?
          '//burburinho.herokuapp.com' :
          '//localhost:5000';
}

function updateDraftList(buzz){

    if (buzz.type === 'gallery') {
        var jsonContent = [];
        var galleryContentItems = $('<ul>' + buzz.content.map(function(item) {
            jsonContent.push('{"url": "' + item.url + '", "description": "' + item.description + '"}');
            return  '<li>' + item.url + '</li>';
        }) + '</ul>');

        buzz.content = '[' + jsonContent.join(',') + ']';
    } else {
        galleryContentItems = $('<p>'+buzz.content+'</p>');
    }

    var list = $('aside .list-buzz');
    var div = $('<div/>', { class: 'buzz', id:buzz.id, 'data-buzz': JSON.stringify(buzz) });

    if($('.draft-list .to-remove')[0]) {
        $('.draft-list .to-remove').remove();
    }

    var date = buzz.timestamp.split(' ')[0].split('-', 3);
    date.shift();
    date.reverse();

    $('table.draft-list tbody').append(
      '<tr>' +
      '<td>' + getLabelOfType(buzz.type) + '</td>' +
      '<td>' + date.join('/') + '</td>' +
      '<td>' + galleryContentItems.html() + '</td>' +
      '<td>' + buzz.local + '</td>' +
      '<td>' +
      '<button data-draft-id="' + (drafts.length - 1) +
      '" type="button" class="btn btn-outlined btn-theme btn-lg publish-draft-message" >Publicar</button>' +
      '</td>' +
      '</tr>'
      );

    list.append(div);
    createAlertMessage('Rascunhos e aguardando confirmação de envio');
}

var addDraftOnList = function(data) {
  var draft = data.message;
  drafts.push(draft);
  updateDraftList(draft);
};

if (typeof io !== 'undefined') {
  var socket = io.connect(getSocketIOUrl());
  socket.on('draft', addDraftOnList);
}
