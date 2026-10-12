function pspHeaderLink(scope, element, attrs, controller) {

	var KEY = {
		ENTER: 13,
		SPACE: 32
	};
    $(element).on('click', 'a.navbar-brand', function(e) {
        scope.expanded = false;
    });
    $(element).on('click.nav', '.navbar-collapse.in', function(e) {
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
    $(element).on('keydown', '.dropdown-menu > .header-menu-item', function(e) {
        var target = e.target;
        if (target.localName === 'a') {
            if (e.keyCode === 37 || e.keyCode === 39) {
                e.preventDefault();
                $(target).parents('li').removeClass('open');
                $(target).parents('li').find('a').focus();
            } else if (e.keyCode === 9) {
                $(target).parents('li').removeClass('open');
            }
        }
    });

    $('body').click(function(event) {
        if ($(event.target).text() !== controller.toursTranslation && !$(event.target).is("[aria-expanded]") && scope.isMobileViewOnDesktopExpanded && !(document.getElementsByClassName("mobile-menu-modal-list")[0].contains(event.target)))
            scope.toggleMobileMenuVisibility();
    });

    // Closing mobile navigation menu after hitting Tab key on Logout option to focus on next DOM element on the page.
    $(document).on('keydown', 'ul > li.logout > a[href*="logout"]', function(keyDownEvent) {
        var TAB_KEY_VALUE = 'Tab';

        if (keyDownEvent.key === TAB_KEY_VALUE && scope.mobileDevice) {
            scope.$applyAsync(function() {
                scope.toggleMobileMenuVisibility();
            });
        }
    });
    $(document).on('keydown', 'ul > li.login', function(keyDownEvent) {
        var TAB_KEY_VALUE = 'Tab';

        if (keyDownEvent.key === TAB_KEY_VALUE && scope.mobileDevice) {
            scope.$applyAsync(function() {
                scope.toggleMobileMenuVisibility();
            });
        }
    });
    // Helper function to handle the arrow key navigation in the header
    function handleKeyPressEvents(e) {
        var target = e.target;
        var querySelector;
        if ($(this).hasClass('main-header-item'))
            querySelector = 'li.main-header-item';
        else if ($(this).hasClass('gt-menu-item'))
            querySelector = 'li.gt-menu-item';

        if (target.localName === 'a') {
            var currentMenuItem = $(target).parents('li');
            var parentUL = currentMenuItem.parents('ul');
            var allMenuItems = parentUL.children(querySelector);
            var firstMenuItem = allMenuItems.first();
            var lastMenuItem = allMenuItems.last();
            var menuItemToFocus;

            // Only Side arrow keys should work for gt-menu-item and only vertical arrow keys should work for main-header-item
            if (querySelector === 'li.gt-menu-item' && !(e.keyCode === 37 || e.keyCode === 39 || e.keyCode === 9))
                return;
            else if (querySelector === 'li.main-header-item' && !(e.keyCode === 38 || e.keyCode === 40))
                return;

            if (querySelector === 'li.gt-menu-item') {
                if (e.keyCode === 9) {
                    $(target).parents('li').removeClass('open');
                    return;
                } else {
                    e.preventDefault();
                    currentMenuItem.removeClass('open');
                }
            } else
                e.preventDefault();

            if (e.keyCode === 37 || e.keyCode === 38) {
                var previousMenuItem = currentMenuItem.prevAll(querySelector);
                currentMenuItem.prevAll(querySelector).first();
                //enable circular navigation
                menuItemToFocus = previousMenuItem.length ? previousMenuItem : lastMenuItem;
                menuItemToFocus.find('a').focus();
            } else if (e.keyCode === 39 || e.keyCode === 40) {
                var nextMenuItem = currentMenuItem.nextAll(querySelector).first();
                //enable circular navigation
                menuItemToFocus = nextMenuItem.length ? nextMenuItem : firstMenuItem;
                menuItemToFocus.find('a').focus();
            }
        }
    }

    // Handler to focus the first element of More Items dropdown on pressing Space/Enter/Down Arrow key.
    $(element).on('keydown', '#more-items-button', function(e) {
        if (e.keyCode === 32 || e.keyCode === 13 || e.keyCode === 40) {
            e.preventDefault();
            var target = e.target;
            var moreItemsDropdown = '#more-items-dropdown';
            $(target).click();
            $(moreItemsDropdown).find('li.header-menu-item a:first').focus();
        }
    });

    // Capturing the arrow key navigation in mega menu for both desktop and mobile view  
    $(element).on('keydown', '.gt-menu-item, .main-header-item', handleKeyPressEvents);

    var rateLimitedCallback = debounce(function() {
        scope.$apply(function() {
            // update current scope based on the new innerWidth and let angular update the view.
            var spPageRoot = document.querySelector(".sp-page-root");
            scope.mobileDevice = controller.data.isMobile || (spPageRoot.clientWidth <= controller.MOBILE_DEVICE_SCREEN_WIDTH);
        });
    }, 250);

    $(window).resize(rateLimitedCallback);

    // This helper returns a function, that, as long as it continues to be invoked, will not
    // be triggered. The function will be called after it stops being called for
    // N milliseconds. If `immediate` is passed, trigger the function on the
    // leading edge, instead of the trailing.
    function debounce(func, wait, immediate) {
        var timeout;
        return function() {
            var context = this,
                args = arguments;
            var later = function() {
                timeout = null;
                if (!immediate) func.apply(context, args);
            };
            var callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(context, args);
        };
    }
}
