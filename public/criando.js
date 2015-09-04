/* global $, alert, moment */
var buzzs = [];
var itemEditIndex = 0;
var itemEditIsDraft = false;
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

function publishBuzz (buzz) {
    if (buzz.type === 'gallery') {
        buzz.content = JSON.parse(buzz.content);
    }
    return $.post( '/api/buzzes', buzz);
}

function saveDraft(buzz) {
    if (buzz.type === 'gallery') {
        buzz.content = JSON.parse(buzz.content);
    }
    return $.post( '/api/drafts', buzz);
}

function updateDraft(draft) {
    if (draft.type === 'gallery') {
        draft.content = JSON.parse(draft.content);
    }

    return $.ajax({
      url: '/api/drafts/' + draft._id,
      type: 'PUT',
      data: draft
    });
}

function deleteDraft(draftId) {
    return $.ajax({
      url: '/api/drafts/' + draftId,
      type: 'DELETE'
    });
}

function addBuzz(){
    var local     = $('input.local').val();
    var timestamp = moment().format('YYYY-MM-DD HH:mm:ss');
    var content   = $('textarea.text').val();
    var author   = !!$('input.author')[0] ? $('input.author').val() : 'Redator';

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

    buzzs.push(buzz);
    saveDraft(buzz).then(function(){
      resetForm();
    });
}

function resetForm() {
  $('input.local, textarea.text, input.video, input.photo, input.author').val('');
  $('#type').trigger('change');
  $('.element.photo.preview').attr('src', '//farm1.staticflickr.com/695/20543448415_4efb795e63_b.jpg');
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

function createItemValueObject() {

  var local       = $('input[name="local"]').val();
  var timestamp   = moment().format('YYYY-MM-DD HH:mm:ss');
  var content     = $('textarea[name="texto"]').val();
  var video       = $('input.video').val();
  var photo       = $('input.photo').val();
  var type        = $('#type').val();
  var id          = (new Date()).getTime();

  var buzz = {
      local: local,
      timestamp: timestamp,
      type: type
  };

  if (!!$('input.author')[0]) {
  	buzz.author = $('input.author').val();
  }

  if( type === 'video' ){
      buzz.url = '//www.youtube.com/embed/' + getYoutubeId(video);
  }else if( $.inArray(type, ['photo', 'quote']) !== -1){
      buzz.url = photo;
  } else if (type === 'gallery') {
      buzz.content = galleryListItems;
  }

  if(content !== ''){
      buzz.content = content;
  }

  return buzz;
}

$('body').on('click', '.publish-message', function() {
    var buzzId = $(this).data('buzz-id');
    publishBuzz(buzzs[buzzId]).then(function(){
      $('button[data-buzz-id="' + buzzId + '"]').parents('tr').remove();
      if ( !$('.publish-list tbody tr')[0]) {
          $('.publish-list tbody').append('<tr class="to-remove">' +
              '<td colspan="6">Nenhum burburinho cadastrado</th>' +
              '</tr>');
      }
      createAlertMessage('Conteúdo enviado para a timeline');
      resetForm();

    });
})
.on('click', '.edit-publish', function(){

    $('.go').addClass('is-hidden');

    var buzzId = $(this).data('buzz-id');
    itemEditIndex = buzzId;
    var buzz = buzzs[buzzId];

    $('.cancel, .edit').removeClass('is-hidden');
    $('.publish-list tbody tr:eq(' + buzzId + ')').addClass('is-hidden');
    $('#type option[value="' + buzz.type +'"]').attr('selected', true);

    $('input[name="local"]').val(buzz.local);
    if (!!$('input.author')[0]){
    	$('input.author').val(buzz.author);
    }
    $('textarea[name="texto"]').val(buzz.content);

    if ($.inArray(buzz.type, ['photo', 'quote']) !== -1 && buzz.url !== '') {
      $('img.preview').attr('src', buzz.url);
      $('input.element.photo').val(buzz.url);
    }

    if (buzz.type === 'video') {
      $('input.video').val(window.location.protocol + buzz.url);
    }

    $('html, body').animate({ scrollTop: 0 }, 'fast');
})
.on('click', '.delete-draft', function(){

  if (confirm('Tem certeza de que quer remover este burburinho?')) {

    $('.cancel, .edit').addClass('is-hidden');
    $('.go').removeClass('is-hidden');
    $('.draft-list tbody tr, .publish-list tbody tr')
            .removeClass('is-hidden');

    var draftId = $(this).data('draft-id');
    deleteDraft(drafts[draftId]._id).then(function() {
      drafts.splice(draftId, 1);

      resetForm();
      itemEditIndex = 0;
      itemEditIsDraft = false;
      $('.delete-draft[data-draft-id="' + draftId + '"]')
              .parents('tr')
              .remove();
      createAlertMessage('Conteúdo removido da lista de rascunhos');
    });
  }

})

.on('click', '.edit-draft', function(){

    $('.cancel, .edit').removeClass('is-hidden');
    $('.go').addClass('is-hidden');

    var draftId = $(this).data('draft-id');
    itemEditIndex = draftId;
    var draft = drafts[draftId];
    itemEditIsDraft = true;

    $('.draft-list tbody tr:eq(' + draftId + ')').addClass('is-hidden');
    $('#type option[value="' + draft.type +'"]').attr('selected', true);
    $('#type').trigger('change');

    if ($.inArray(draft.type, ['photo', 'quote']) !== -1 && draft.url !== '') {
      $('img.preview').attr('src', draft.url);
      $('input.element.photo').val(draft.url);
    }
    $('input[name="local"]').val(draft.local);
    if (!!$('input.author')[0]){
    	$('input.author').val(draft.author);
    }

    if (draft.type === 'video') {
      $('input.video').val(window.location.protocol + draft.url);
    }
    $('textarea[name="texto"]').val(draft.content);
    $('html, body').animate({ scrollTop: 0 }, 'fast');
})
.on('click', '.cancel', function(){
  $('.cancel, .edit').addClass('is-hidden');
  $('.go').removeClass('is-hidden');
  $('.draft-list tbody tr, .publish-list tbody tr')
          .removeClass('is-hidden');

  resetForm();
  itemEditIndex = 0;
  itemEditIsDraft = false;
})
.on('click', '.edit', function(){
  $('.cancel, .edit').addClass('is-hidden');
  $('.go').removeClass('is-hidden');
  $('.draft-list tbody tr, .publish-list tbody tr')
          .removeClass('is-hidden');

  var draft = createItemValueObject();
  var oldDraft = drafts[itemEditIndex];
  draft._id = oldDraft._id;
  draft.author = oldDraft.author;

  updateDraft(draft).then(function(){
    updateDraftList(draft, true, itemEditIndex);

    $('.draft-list tbody tr, .publish-list tbody tr')
          .removeClass('is-hidden');

    drafts[itemEditIndex] = draft;
    itemEditIndex = 0;
    itemEditIsDraft = false;
    resetForm();
  });
})
.on('click', '.publish-draft-message', function() {
    var draftId = $(this).data('draft-id');
    var draft = drafts[draftId];
    $.ajax({
      url: '/api/drafts/' + draft._id,
      type: 'DELETE',
      success: function(result) {
        publishBuzz(draft).then(function(){
          $('button[data-draft-id="' + draftId + '"]').delay(800).parents('tr').remove();
          if ( !$('.draft-list tbody tr')[0]) {
              $('.draft-list tbody').append('<tr class="to-remove">' +
                  '<td colspan="6">Nenhum rascunho cadastrado</th>' +
                  '</tr>');
          }
          createAlertMessage('Conteúdo enviado para a timeline');

        });
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

        if ($('.author')[0]) {
          $('.author').show();
        }

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
    var origin = window.location.origin;
    if(origin.indexOf('localhost') !== -1) {
        return '//localhost:5000';
    } else if(origin.indexOf('test') !== -1) {
        return '//test-burburinho.herokuapp.com';
    } else {
        return '//burburinho.herokuapp.com';
    }
}

function updateDraftList(buzz, showMessage, index){

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

    var elementString = '.draft-list tbody';
    var draftId = !isNaN(index) ? index : (drafts.length - 1);

    var template = '<td>' + buzz.author + '</td>' +
      '<td>' + getLabelOfType(buzz.type) + '</td>' +
      '<td>' + date.join('/') + '</td>' +
      '<td>' + galleryContentItems.html() + '</td>' +
      '<td>' + buzz.local + '</td>' +
      '<td>' +
      '<button data-draft-id="' + draftId +
      '" type="button" class="btn btn-outlined btn-theme btn-lg publish-draft-message" >Publicar</button>' +
      '<button data-draft-id="' + draftId +
      '" type="button" class="btn btn-outlined btn-theme btn-lg edit-draft" >Editar</button>' +
      '<button data-draft-id="' + draftId +
      '" type="button" class="btn btn-outlined btn-theme btn-lg delete-draft" >Remover</button>' +
      '</td>';

    if (!isNaN(index)) {
      elementString += ' tr:eq(' + index + ')';
    } else {
      template = '<tr>' + template + '</tr>';
    }

    $(elementString)[!isNaN(index) ? 'html' : 'append'](template);

    list.append(div);
    if (!!showMessage) {
      createAlertMessage('Rascunhos e aguardando confirmação de envio');
    }
}

var addDraftOnList = function(data, showMessage) {
  showMessage = typeof showMessage !== 'undefined' ? showMessage : true;
  var draft = typeof data.message !== 'undefined' ? data.message : data;
  drafts.push(draft);
  updateDraftList(draft, showMessage);
};

if (typeof io !== 'undefined') {
  var socket = io.connect(getSocketIOUrl());
  socket.on('draft', addDraftOnList);

  $(window).load(function(){

    if( window.UA.isMobile() ) {
      $('input.form-control, select.form-control, textarea.form-control').addClass('input-lg');
      $('.go').addClass('btn-lg btn-block');
      $('#type option[value="video"]').remove();
    }

    $.getJSON('/api/drafts', function(drafts) {
      if (drafts.length <= 0) {
        return;
      }

      $.each(drafts, function(index, draft) {
        addDraftOnList({message: draft}, false);
      });
    })
  });
}
