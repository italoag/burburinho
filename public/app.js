$(function(){
	var toggleMenu = $('[data-attr="toggleMenu"]');

	toggleMenu.on('click', function(){
		menuCollapse();
	});

	var menuCollapse = function() {
		var menu = $('[data-attr="menu"]');
		menu.toggleClass('is-closed');
	}

});
