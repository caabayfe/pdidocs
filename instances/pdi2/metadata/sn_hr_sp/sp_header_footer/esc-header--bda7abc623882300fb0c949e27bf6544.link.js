function escHeaderLink(scope, element) {
	$(element).on('click', 'a.navbar-brand', function(e) {
		scope.expanded = false;
	});
	$(element).on('click.nav','.navbar-collapse.in',function(e) {
		var target = $(e.target);
		if (target.is('a') && !target.hasClass("dropdown-toggle") && target.siblings('.dropdown-menu').length == 0) {
			// collapse mobile nav if clicked an anchor that isn't a dropdown toggle
			scope.expanded = false;
			return;
		}
		
		// if neither target nor parent is an anchor or the parent anchor is a dropdown-toggle, do nothing
		if (!target.parent().is('a') || target.parent().hasClass("dropdown-toggle") || target.parent().siblings('.dropdown-menu').length > 0)
			return;
		
		// collapse mobile nav if target is part of a submenu
		if (target.parents("ul.dropdown-menu").length > 0) {
			scope.expanded = false;
			return;
		}
		
		// collapse mobile nav is target is part of the dropdown
		if (target.parents("div.navbar-collapse").length > 0)
			scope.expanded = false;
	});
	$(element).on('keydown','.dropdown-menu > .header-menu-item',function(e){
		var target = e.target;
		if (target.localName == 'a') {
			if(e.keyCode == 37) {
				e.preventDefault();
				$(target).parents('li').removeClass('open');
				$(target).parents('li').find('a').focus();
			} else if(e.keyCode == 39) {
				e.preventDefault();
				$(target).parents('li').removeClass('open');
				$(target).parents('li').find('a').focus();
			}
			if(e.keyCode == 9) {
				$(target).parents('li').removeClass('open');
			}
		}
	});
	
	$(element).on('keydown','.header-menu-item',function(e){
		var target = e.target;
		if (target.localName == 'a') {
			var currentMenuItem = $(target).parents('li');
			var parentUL = currentMenuItem.parents('ul');
			var allMenuItems = parentUL.children('li:visible');
			var firstMenuItem = allMenuItems.first();
			var lastMenuItem = allMenuItems.last();
			var menuItemToFocus;
			
			if(e.keyCode == 37) {
				e.preventDefault();
				currentMenuItem.removeClass('open');
				var previousMenuItem = currentMenuItem.prevAll('li:visible').first();
				//enable circular navigation
				menuItemToFocus = previousMenuItem.length ? previousMenuItem : lastMenuItem;
				menuItemToFocus.find('a').focus();
			} else if(e.keyCode == 39) {
				e.preventDefault();
				currentMenuItem.removeClass('open');
				var nextMenuItem = currentMenuItem.nextAll('li:visible').first();
				//enable circular navigation
				menuItemToFocus = nextMenuItem.length ? nextMenuItem : firstMenuItem;
				menuItemToFocus.find('a').focus();
			}
			
			if(e.keyCode == 9) {
				$(target).parents('li').removeClass('open');
			}
		}
	});
	
}
