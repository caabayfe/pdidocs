function escHeaderLink(scope, element, attrs, controller) {
    $(element).on('click', 'a.navbar-brand', function(e) {
        scope.expanded = false;
    });
    //defaults for calulating width of components
    var DEFAULT_RIGHT_NAVIGATION_SIZE = 400;
    var DEFAULT_LOGO_SIZE = 300;

    //added these to scope so that these can be potentially used in controller
    scope.navbarRightSize = 0;
    scope.navbarRightFinalSize = 0
    scope.navbarRightTop = 0;
    scope.navbarSearchSize = 0;
    scope.navbarSearchFinalSize = 0
    scope.navbarSearchTop = 0;
    scope.navLogoFinalSize = 0;

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
                $(target).parents('div').removeClass('open');
            }
        }
    });

    $('body').click(function(event) {
        if ($(event.target).text().trim() != controller.toursTranslation && scope.isMobileViewOnDesktopExpanded)
            scope.toggleMobileMenuVisibility();
    });

    // Closing mobile navigation menu after hitting Tab key on Logout option to focus on next DOM element on the page.
    $(document).on('keydown', '.impersonate-and-logout > div > ul > li > a[href*="logout"]', function(keyDownEvent) {
        var TAB_KEY_VALUE = 'Tab';

        if (keyDownEvent.key === TAB_KEY_VALUE && !keyDownEvent.shiftKey && scope.mobileDevice) {
            scope.$applyAsync(function() {
                scope.toggleMobileMenuVisibility();
            });
        }
    });

    // this is for the fact that the impersonate and logout widget has hardcoded mobile size, and for screen width
    // greater than 767 pixel, the impersonate and dropdown li has tabindex -1, hence handling that case to close menu.
    $(document).on('keydown', '.impersonate-and-logout > div > ul > li', function(keyDownEvent) {
        var TAB_KEY_VALUE = 'Tab';
        var dropdownItems = $('.impersonate-and-logout > div > ul > li > a + ul > li > a');
        if (dropdownItems.length > 0) {
            //Close mega menu only if focus is at the last element of the menu and tab key is entered
            if (document.activeElement === dropdownItems[dropdownItems.length - 1]) {
                if (keyDownEvent.key === TAB_KEY_VALUE && !keyDownEvent.shiftKey && (scope.mobileDevice || scope.showMobileMenuOnDesktop)) {
                    scope.$applyAsync(function() {
                        scope.toggleMobileMenuVisibility();
                    });
                }
            }
        }
    });

    // Helper function to handle the arrow key navigation in the header
    function handleKeyPressEvents(e) {
        var target = e.target;
        var querySelector;
        if ($(this).hasClass('gt-menu-item'))
            querySelector = 'li.gt-menu-item';

        // Only Side arrow keys should work for gt-menu-item and only vertical arrow keys should work for header-nav-item
        if (querySelector === 'li.gt-menu-item' && !(e.keyCode === 37 || e.keyCode === 39 || e.keyCode === 9))
            return;
        else if ($(this).parents('.header-nav-item').length !== 0 && !(e.keyCode === 38 || e.keyCode === 40))
            return;

        //desktop view prework
        var currentMenuItem = $(target).parents('li');
        var parentUL = currentMenuItem.parents('ul');
        var allMenuItems = parentUL.children(querySelector);
        var firstMenuItem = allMenuItems.first();
        var lastMenuItem = allMenuItems.last();
        var menuItemToFocus;

        if (querySelector === 'li.gt-menu-item') {
            if (e.keyCode === 9) {
                $(target).parents('li').removeClass('open');
                return;
            } else {
                e.preventDefault();
                currentMenuItem.removeClass('open');
            }
        }

        //mobile view navigation prework
        var items = [];
        var selectors = [];
        selectors.push('li.main-header-item>a'); //main header items -> Employee Center Header widget
        if (scope.exFeedbackActive)
            selectors.push('li.main-header-item>div>a.experience-feedback-header-item'); //Experience Feedback Header widget mobile menu item
        selectors.push('li.header-menu-item>a#tour-dropdown'); // Tour drop down -> EC Menu widget
        selectors.push('li.user-name>a'); // User Name -> Employee Center Header widget
        selectors.push('.impersonate-and-logout > div > ul > li > a + ul > li > a'); // Logout/Impersonate -> Profile with Drop Down widget
        selectors.push('.impersonate-and-logout li.visible-xs-block>a');
        for (var i = 0; i < selectors.length; i++) {
            //Dont include hidden profile button
            if (selectors[i] === '.impersonate-and-logout > div > ul > li > a + ul > li > a') {
                items.push($(selectors[i]).slice(1).get());
            } else {
                items.push($(selectors[i]).get());
            }
        }
        items = [].concat.apply([], items);

        //mobile view navigation starts
        if ($(target).parents('.header-nav-item').length) {
            var index = items.indexOf($(':focus').get(0));
            if (e.keyCode === 40) {
                e.preventDefault();
                index = index + 1;
            } else if (e.keyCode === 38) {
                e.preventDefault();
                if (index === 0) {
                    $('.mega-menu-item').filter(':visible').last().focus();
                }
                index = index - 1;
            }
            if (index < items.length && index >= 0)
                items[index].focus();
        } //else if desktop view
        else if (target.localName === 'a') {
            if (e.keyCode === 37) {
                var previousMenuItem = currentMenuItem.prevAll(querySelector);
                currentMenuItem.prevAll(querySelector).first();
                //enable circular navigation
                menuItemToFocus = previousMenuItem.length ? previousMenuItem : lastMenuItem;
                menuItemToFocus.find('a').focus();
            } else if (e.keyCode === 39) {
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
    $(element).on('keydown', '.gt-menu-item, .header-nav-item', handleKeyPressEvents);

    /*
     * this is the method, which calculates the navbar component total width,
     * the main logic is that when the navbar wraps for text zoom or for normal case,
     * the top increases from 0, and then the mobile view is triggered.
     * It also takes care of edge cases, with and without the searchbar
     */
    scope.calulatedNavbarWidth = function(inDigest) {
        //if the text zoom level is less than 100% then falling back to normal mobileDevice calculation
        var spPageRoot = document.querySelector(".sp-page-root");
        var spPageRootWidth = spPageRoot.clientWidth;
        var currentFontSize = parseInt($('body').css('font-size'));
        var constantOffset = 50;
        var flexOffsetWidth = constantOffset * (currentFontSize / 16);
        if (currentFontSize < 16) {
            scope.$apply(function() {
                scope.mobileDevice = controller.data.isMobile || (spPageRootWidth <= controller.MOBILE_DEVICE_SCREEN_WIDTH);
            });
            return;
        }
        var headerSearch = angular.element(".header-search");
        var navbarBrand = angular.element(".navbar-brand-logo > img");
        var navbarRight = angular.element(".navbar-right > div");
        var navbarLoader = angular.element(".navbar-header > .sp-loading-indicator");
        var currentNavbarSize = 0;
        scope.navLoaderSize = 26;
        if (navbarBrand && navbarBrand.length >= 1)
            scope.navLogoFinalSize = navbarBrand[navbarBrand.length - 1].offsetWidth;
        if (navbarRight && navbarRight.length >= 1 && scope.navbarRightTop == 0) {
            var tempSize = scope.navbarRightSize;
            scope.navbarRightSize = navbarRight[navbarRight.length - 1].offsetWidth
            scope.navbarRightTop = navbarRight[navbarRight.length - 1].clientTop;
            if (navbarRight[navbarRight.length - 1].clientTop > 0) {
                scope.navbarRightFinalSize = tempSize !== 0 ? tempSize : DEFAULT_RIGHT_NAVIGATION_SIZE;
            } else {
                scope.navbarRightFinalSize = scope.navbarRightSize;
            }
        }
        // Calculate current navbar size, using default sizes when necessary
        currentNavbarSize += scope.navLogoFinalSize || DEFAULT_LOGO_SIZE;
        currentNavbarSize += scope.navbarRightFinalSize || DEFAULT_RIGHT_NAVIGATION_SIZE;

        // Compute available space for search bar
        var availableSizeForSearch = spPageRootWidth - currentNavbarSize - scope.navLoaderSize - flexOffsetWidth * 3;

        // Determine if the navbar fits in a single line
        var navBarFitsInViewport = availableSizeForSearch >= 250;

        if (!navBarFitsInViewport) {
            // Switch to mobile search bar
            var headerSearchMobile = angular.element(".header-search-mobile");
            if (headerSearchMobile.length) {
                headerSearchMobile.css('width', '100%');
            }
        } else {
            // Maintain search bar width between 250 and 600 pixels
            availableSizeForSearch = Math.max(250, Math.min(600, availableSizeForSearch));

            // Apply the calculated width to the search bar
            if (headerSearch.length) {
                headerSearch.css('width', availableSizeForSearch + 'px');
            }
        }
        if (inDigest) {
            scope.mobileDevice = !navBarFitsInViewport || controller.data.isMobile || (spPageRootWidth <= controller.MOBILE_DEVICE_SCREEN_WIDTH);
        } else {
            scope.$apply(function() {
                // update current scope based on the new spPageRootWidth and let angular update the view.
                scope.mobileDevice = !navBarFitsInViewport || controller.data.isMobile || (spPageRootWidth <= controller.MOBILE_DEVICE_SCREEN_WIDTH);
            });
        }
    };

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
