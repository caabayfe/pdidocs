function link(scope, element, attrs, controller) {
    //if click is out of menu or in the empty space below megamenu (in expanded view), mega menu should be closed
    $('body').bind('click', function(event) {
        var targetEle = event.target;
        if (element.find(targetEle).length > 0)
            return;

        scope.$applyAsync(function() {
            controller.closeMegaMenu();
        });
    });

    $(element).on("keydown", ".mega-menu", scope.handleMegaMenuKeyboardEvent);

    // This helper method returns comma separated list of selectors (that need ellipsis) as a string
    function getCommaSeparatedListOfSelectors() {
        return [
            '.simple-list .dropdown-menu-item span:not(.icon)',
            '.mega-menu-item span:not(.icon)',
            '.browse-button span',
            '.quick-link-title',
            '.mobile-mega-menu__quick-link a',
            '.quick-links-container a',
            '.level-one-topic-name',
            '.level-one-topic-name span:not(.icon)',
            '.level-two-topic-name',
            '.level-two-topic-name span:not(.icon)',
            '.tab-list'
        ].join();
    }

    function getSpanElement(parentElement) {
        var $parent = $(parentElement);
        var childSpanElements = ['.quick-link-title', '.level-one-topic-ellipsis', '.level-two-topic-ellipsis'];
        for (var i = 0; i < childSpanElements.length; i++) {
            var spanSelector = childSpanElements[i];
            if ($parent.find(spanSelector).length > 0)
                return $parent.find(spanSelector)[0];
        }
        return parentElement;
    }

    // Show tooltip when level one mega menu item name overflows container width.
    $(document).on('mouseenter focus', getCommaSeparatedListOfSelectors(), function() {
        // Focus event is not fired on span elements. So using currentThis to check for
        // ellipsis condition when a quick link/topic is focused during keyboard navigation.
        var currentThis = getSpanElement(this);
        $this = $(currentThis);

        if ((currentThis.offsetWidth < currentThis.scrollWidth || currentThis.offsetHeight < currentThis.scrollHeight) && !$this.attr('title')) {
            $this.tooltip({
                title: function() {
                    return $this.text();
                },
                placement: 'bottom',
                trigger: 'manual',
                container: 'body'
            });
            if (!controller.isIE) {
                $this.tooltip('show');
            }
        }
    });

    // Hide tooltip when focus is lost. This is done explicitly as we are using trigger: 'manual' in tooltip options.
    $(document).on('mouseleave blur', getCommaSeparatedListOfSelectors(), function() {
        // Blur event is not fired on span elements. So using currentThis to check for
        // ellipsis condition when a quick link/topic is focused out during keyboard navigation.
        var currentThis = getSpanElement(this);
        $(currentThis).tooltip('hide');
    });

    /* Check for ellipsis on parent of the focused mega menu link and add a right border to it.
    This is needed as right border is not visible due to overflow: hidden on parent element */
    $(document).on('focus', '.level-one-topic-name, .level-two-topic-name', function() {
        var parent = $(this).parent().get(0);
        if (parent.offsetWidth < parent.scrollWidth || parent.offsetHeight < parent.scrollHeight) {
            $(this).parent().addClass('focused-link-parent');

            if ($(this).hasClass('level-two-topic-name') || $(this).closest('.orphan-list').length > 0) {
                $(this).parent().addClass('link-with-margin');
            }
        }
    });

    // Remove right border, margin (`link-with-margin` class) on elements that have one due to `focused-link-parent` class.
    $(document).on('blur', '.level-one-topic-name, .level-two-topic-name', function() {
        $('.focused-link-parent').removeClass('focused-link-parent');
        $('.link-with-margin').removeClass('link-with-margin');
    });

    var rateLimitedCallback = debounce(function() {
        scope.$apply(function() {
            // update current scope based on the new ec header width and let angular update the view.
            scope.isWindowResized = true;
            scope.isMobileView = controller.data.isMobile || ($('.sp-page-root').width() <= controller.MOBILE_DEVICE_SCREEN_WIDTH);
            if (scope.isMobileView) {
                controller.closeMegaMenu();
            }
        });
    }, 250);

    $(window).resize(rateLimitedCallback);

    if (window.ResizeObserver) {
        var spPageRoot = document.querySelector(".sp-page-root");
        var resizeObserver = new ResizeObserver(rateLimitedCallback);
        if (spPageRoot)
            resizeObserver.observe(spPageRoot);
    }

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

    // This helper function is used to control the keyboard arrow key navigation throughout the mega menu
    // KeyCode mappings - https://www.cambiaresearch.com/articles/15/javascript-char-codes-key-codes
    function arrowNavigation(e) {
        var target = e.target;
        var querySelector;
        if ($(target).hasClass('mega-menu-item'))
            querySelector = target.localName + '.mega-menu-item';
        else if ($(target).hasClass('dropdown-menu-item'))
            querySelector = target.localName + '.dropdown-menu-item';
        if (target.localName === 'li') {
            var currentMenuItem = $(target);
            var parentUL = currentMenuItem.parents('ul');
            var items, index;

            if (e.keyCode === 38 || e.keyCode === 40) {
                e.preventDefault();
                if (parentUL.length) {
                    items = $(parentUL).find(querySelector);
                    if (!items.length)
                        return;

                    index = items.index(items.filter(':focus'));
                    if (index === -1) return;

                    //for continued navigation in ECHeader mobile view
                    if (index === items.length - 1) {
                        if (e.keyCode == 38) {
                            index = (index - 1);
                            items[index].focus();
                        } else if (e.keyCode === 40) {
                            // Allow keyboard users to escape navigation and reach page content
                            var pageContent = $('.sp-page-root .container-fluid');
                            var focusableElements = pageContent.find('a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])').filter(':visible:not([disabled])');
                            if (focusableElements.length > 0) {
                                focusableElements.first().focus();
                                return;
                            }
                            // Fallback to original behavior if no focusable elements found
                            if ($('li.main-header-item>a').length !== 0)
                                $('li.main-header-item>a').get(0).focus();
                        }
                    } //for navigation within Megamenu mobile (ECNavigation)
                    else {
                        if (e.keyCode === 38) {
                            index = index > 0 ? index - 1 : 0;
                        } else if (e.keyCode === 40) {
                            index = (index + 1);
                        }
                        items[index].focus();
                    }
                }
            } else if (querySelector === 'li.dropdown-menu-item' && (e.keyCode === 37 || e.keyCode === 39)) {
                var currElem = $('div.selected-item');
                closeMenu(e, true, true);
                parentUL = $(currElem).parents('div.main-menu');
                if (parentUL.length) {
                    items = $(parentUL).find('div.navigation-menu-item');
                    if (!items.length)
                        return;

                    index = items.index(items.filter(':focus'));
                    if (index === -1) return;

                    if (e.keyCode == 37)
                        index = (index + items.length - 1) % items.length;
                    else
                        index = (index + 1) % items.length;
                    items[index].focus();
                }
            } else if ((e.keyCode === 9 || e.keyCode === 27) && querySelector === 'li.dropdown-menu-item')
                closeMenu(e, true, true);
            else if (querySelector === 'li.mega-menu-item' && (e.keyCode === 32 || e.keyCode === 13)) {
                if ($(target).hasClass('mobile-mega-menu__quick-link')) {
                    $(target).find('a')[0].click();
                    return;
                }
                e.preventDefault();
                $(target).click();
                if (!$(target).hasClass('menu-link')) {
                    if (!$(target).hasClass('back-container') && !$(target).hasClass('browse-all'))
                        $('.back-container').first().focus();
                    else
                        $("li.mobile-menu-item-" + scope.lastSelectedElementId + ":first").focus();
                }
            }
        }
    }

    // Return focus to back button when pressed tab from last quick link  
    $(element).on('keydown', '.mobile-mega-menu__quick-link:last', function(e) {
        var TAB_KEY_VALUE = 'Tab';
        if (e.key === TAB_KEY_VALUE) {
            scope.$applyAsync(function() {
                $('.back-container').first().focus();
            });
        }
    });

    // Return focus to back button from browse all when no quick links
    $(element).on('keydown', '.browse-all', function(e) {
        var TAB_KEY_VALUE = 'Tab';
        if ($('.mobile-mega-menu__quick-link').length == 0) {
            if (e.key === TAB_KEY_VALUE) {
                scope.$applyAsync(function() {
                    $('.back-container').first().focus();
                });
            }
        }
    });

    $(element).on('keydown', '.mega-menu-item, .dropdown-menu-item', arrowNavigation);

    // Allow Tab key to escape mobile navigation and reach page content
    $(element).on('keydown', '.mobile-navigation-menu-item:last-child', function(e) {
        if (e.keyCode === 9 && !e.shiftKey) { // Tab key without Shift
            var pageContent = $('.sp-page-root .container-fluid');
            var focusableElements = pageContent.find('a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])').filter(':visible:not([disabled])');
            if (focusableElements.length > 0) {
                e.preventDefault();
                focusableElements.first().focus();
            }
        }
    });

    $(element).on('keydown', '.tab-list, .tab-browse', function(e) {
        e.stopPropagation();
        e.preventDefault();
        var target = e.target;
        var currentMenuItem = $(target);
        var parentMenu = $(target).parents('div.employee-center-navigation div.tab-container');
        var items = parentMenu.find('.tab-list');
        var browseButton = parentMenu.find('.tab-browse .browse-button');
        if (browseButton.length)
            items.push(browseButton[0]);
        var index;
        if (e.keyCode === 38 || e.keyCode === 40) {
            closeTabMenu(e, true, false);
            if (parentMenu.length) {
                if (!items.length)
                    return;
                index = items.index(items.filter(':focus'));
                if (index === -1) return;
                if (e.keyCode == 38)
                    index = (index + items.length - 1) % items.length;
                else {
                    index = (index + 1) % items.length;
                }
                items[index].focus();
            }
        } else if ((e.keyCode === 37 || e.keyCode === 9 || e.keyCode === 27) && scope.selectedMainMenu) {
            closeMenu(e, false, true);
        } else if (e.keyCode === 39 || e.keyCode === 13 || e.keyCode === 32) {
            e.preventDefault();
            if (!scope.selectedMenuItem && (!currentMenuItem.hasClass('menu-link') || (currentMenuItem.hasClass('menu-link') && (e.keyCode !== 40))))
                target.click();
            setTimeout(function() {
                controller.toggleSubMenuVisibility();
                var menuContainer = $('div.dropdown-container div.menu-container');
                if (scope.selectedMenuItem) {
                    var dropdownMenu = menuContainer.children('#menu_' + scope.selectedMenuItem.sys_id);
                    focusFirstAvailableItem(dropdownMenu);
                }
            });
        }
    });

    $(element).on('keydown', '.navigation-menu-item', function(e) {
        var target = e.target;
        if (target.localName === 'div') {
            var currentMenuItem = $(target);
            var parentMenu = $(target).parents('div.main-menu');
            var items = parentMenu.children('div.navigation-menu-item');
            var index;

            if (e.keyCode === 37 || e.keyCode === 39) {
                closeMenu(e, true, false);

                if (parentMenu.length) {
                    if (!items.length)
                        return;

                    index = items.index(items.filter(':focus'));
                    if (index === -1) return;

                    if (e.keyCode == 37)
                        index = (index + items.length - 1) % items.length;
                    else
                        index = (index + 1) % items.length;
                    items[index].focus();
                }
            } else if ((e.keyCode === 38 || e.keyCode === 9 || e.keyCode === 27) && scope.selectedMenuItem) {
                closeMenu(e, false, false);
            } else if (e.keyCode === 40 || e.keyCode === 13 || e.keyCode === 32) {
                e.preventDefault();
                if ($(target).hasClass('expanded-menu')) {
                    if (!scope.selectedMainMenu && (!currentMenuItem.hasClass('menu-link') || (currentMenuItem.hasClass('menu-link') && (e.keyCode !== 40))))
                        target.click();
                    setTimeout(function() {
                        if (scope.selectedMainMenu) {
                            controller.toggleMegaMenuVisibility();
                            setTimeout(function() {
                                var tabContainer = $('div.employee-center-navigation div.dropdown-container div.tab-container');
                                tabContainer.find('.tab-list:first').focus();
                            });
                        }
                    });
                } else {
                    if (!scope.selectedMenuItem && (!currentMenuItem.hasClass('menu-link') || (currentMenuItem.hasClass('menu-link') && (e.keyCode !== 40))))
                        target.click();
                    setTimeout(function() {
                        var menuContainer = $('div.dropdown-container div.menu-container');
                        if (scope.selectedMenuItem) {
                            controller.toggleSubMenuVisibility();
                            controller.toggleMegaMenuVisibility();
                            var dropdownMenu = menuContainer.children('#menu_' + scope.selectedMenuItem.sys_id);
                            if (dropdownMenu.hasClass('simple-menu'))
                                dropdownMenu.find('ul.simple-list li:first').focus();
                            else if (dropdownMenu.hasClass('mega-menu'))
                                focusFirstAvailableItem(dropdownMenu);
                        }
                    });
                }
            }

        }
    });

    // Closing the level 2 mega-menu when Shift+ Tab key pressed
    controller.shiftKeyPressed = false;
    $(element).on('keydown', '.level-one-first-item', function(e) {
        if (e.keyCode === 9 && controller.shiftKeyPressed)
            if (scope.selectedMainMenu)
                closeTabMenu(e, true, true);
            else
                closeMenu(e, true, true);
    });

    $(element).on('keydown', '.tab-list', function(e) {
        if (e.keyCode === 9 && controller.shiftKeyPressed)
            closeMenu(e, true, true);
    });

    // Closing the mega-menu when tab key is pressed on the Browse Button or escape key is pressed.
    $(element).on('keydown keyup', function(e) {
        if (e.keyCode === 16)
            controller.shiftKeyPressed = (e.type === 'keydown');
        else if (e.type === 'keydown') {
            if (e.keyCode === 9 && !controller.shiftKeyPressed && $(e.target).hasClass('browse-button'))
                if (scope.selectedMainMenu)
                    closeTabMenu(e, true, true);
                else
                    closeMenu(e, true, true);
            else if (e.keyCode === 27 && $(e.target).is('.browse-button, .level-one-topic-name, .level-two-topic-name, .quick-links-container>ul>li>a, .tab-list'))
                if (scope.selectedMainMenu && scope.selectedMenuItem)
                    closeTabMenu(e, true, true);
                else
                    closeMenu(e, true, true);
        }
    });

    function focusFirstAvailableItem(megaMenu) {
        var availableItem = megaMenu.find('a.level-one-topic-name:first');
        if (!availableItem.length)
            availableItem = megaMenu.find('div.quick-links-container a:first');
        availableItem.focus();
    }

    // Helper function to close Mega menu and focus the parent topic if needed and prevent the default behaviour if needed
    function closeMenu(e, preventDefault, focusParentTopic) {
        if (preventDefault) e.preventDefault();
        if (focusParentTopic) $('div.selected-item').focus();
        scope.$apply(function() {
            controller.closeMegaMenu();
        });
    }

    // Helper function to close Tab menu and focus the parent topic if needed and prevent the default behaviour if needed
    function closeTabMenu(e, preventDefault, focusParentTopic) {
        if (preventDefault) e.preventDefault();
        if (focusParentTopic) $('.tab-list.selected-item').focus();
        scope.$apply(function() {
            controller.closeTabMenu();
        });
    }
}
