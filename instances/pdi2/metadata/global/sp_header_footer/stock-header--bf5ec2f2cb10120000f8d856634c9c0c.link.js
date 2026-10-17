function(scope, element) {
	var KEY = {
		TAB: 9,
		ESC: 27
	};
	
	function isMDScreenSize() {
		return window.matchMedia('(max-width: 992px)').matches;
	}
	
	var navbarContainer = $('#sp-nav-bar');
	navbarContainer.on('shown.bs.collapse', function () {
		$('a:visible', navbarContainer).first().focus();
	});
	
	// Additional mobile-specific ESC key handling for Stock Header
	$(element).on('keyup', function(event) {
		if (event.which == KEY.ESC) {
			var mdScreenSize = isMDScreenSize();
			if (mdScreenSize && $('.navbar-right').attr("aria-expanded")) {
				closeMobileMenu();
				
				if ($(event.target).parents(".navbar-right").length > 0)
					$('.navbar-toggle').focus();
			}
		}
	});

	$(element).on('click.nav','.navbar-collapse.in',function(e) {
		var target = $(e.target);
		if (target.is('a')) {
			if (target.hasClass('sp-menu-has-items'))
				return; // menu item has a submenu, so just toggle it

			// collapse mobile nav if clicked an anchor
			$(this).removeClass('in').addClass('collapse');
			return;
		}

		if (target.parent().hasClass("toggle-dropdown")) {
			// collapse mobile nav if parent has toggle-dropdown class
			$(this).removeClass('in').addClass('collapse');
			return;
		}

		// if neither target nor parent is an anchor, do nothing
		if (!target.parent().is('a'))
			return;

		// collapse mobile nav if target is part of a submenu
		if (target.parents("ul.dropdown-menu").length > 0)
			$(this).removeClass('in').addClass('collapse');
	});

	// clicking outside the mobile menu should close the mobile menu
	$(document).on('click', function(e) {
		var target = $(e.target);
		if (target.parents('.navbar-right').length == 0) {
			closeMobileMenu();
		}
	});
	
	// Close the mobile menu when focus goes out of the menu
	$('.navbar-right').on('keydown', 'a', function(event) {
		if (($(this).is($('.navbar-right a').last()) && event.which == KEY.TAB && !event.shiftKey) || ($(this).is($('.navbar-right a').first()) && event.which == KEY.TAB && event.shiftKey)) {
			closeMobileMenu();
			setTimeout(function () {
				window.scrollBy(0,-200);
			});
		}
	});
	
	function closeMobileMenu() {
		$('.navbar-right').collapse('hide');
	}
}
