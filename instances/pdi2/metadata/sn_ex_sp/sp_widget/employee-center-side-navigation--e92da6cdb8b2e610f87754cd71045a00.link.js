function link(scope, element, attrs, controller) {

    // detect hover capability
    function computeCanHover() {
        try {
            var anyHover = window.matchMedia('(any-hover: hover)').matches;
            var anyFine = window.matchMedia('(any-pointer: fine)').matches;
            return anyHover && anyFine;
        } catch (e) {
            // Fallback for very old browsers
            var hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0;
            return !hasTouch;
        }
    }

    scope.canHover = computeCanHover();

    function updateHover() {
        scope.$applyAsync(function() {
            scope.canHover = mqHover.matches && mqFine.matches;
        });
    }

    // Update when input devices change
    if (window.matchMedia) {
        var mqHover = window.matchMedia('(any-hover: hover)');
        var mqFine = window.matchMedia('(any-pointer: fine)');
        if (mqHover.addEventListener) {
            mqHover.addEventListener('change', updateHover);
            mqFine.addEventListener('change', updateHover);
        } else if (mqHover.addListener) {
            mqHover.addListener(updateHover);
            mqFine.addListener(updateHover);
        }
    }

    $(element).on('keydown', '.item-container', arrowNavigation);

    $(element).on('keydown', '.item-container-mobile', arrowNavigation);

    $(element).on('keydown', '.submenu-item a', subMenuNavigation);

    $(document).bind('click', function(event) {
        var targetEle = event.target;
        if (controller.isElementPartOfMenu(targetEle))
            return;
        closeSubMenu();
    });

    function arrowNavigation(e) {
        if (e.keyCode == 13) {
            controller.handleMenuClick(e);
            setTimeout(function() {
                if (controller.showSubMenu)
                    $('.submenu-container').find('.submenu-item a').get(0).focus();
            }, 50);
        }
    }

    function parentItemSelector() {
        return scope.showLeftNav ? '.item-container' : '.item-container-mobile';
    }

    function subMenuNavigation(e) {
        var parentSelector = parentItemSelector();
        if (e.keyCode === 37 || e.keyCode === 38 || e.keyCode === 39 || e.keyCode === 40) {
            var items = $('.submenu-container').find('.submenu-item a')
            if (!items.length)
                return;

            index = items.index(items.filter(':focus'));
            if (index === -1) return;

            if (e.keyCode == 37 || e.keyCode == 38)
                index = (index + items.length - 1) % items.length;
            else
                index = (index + 1) % items.length;
            items[index].focus();
        } else if (e.keyCode == 9) {
            e.preventDefault();
            if (e.shiftKey)
                $(parentSelector + "[id='" + controller.selectedMenu + "']").get(0).focus();
            else {
                var nextMenu = $($(parentSelector + "[id='" + controller.selectedMenu + "']").parent('div').get(0).nextElementSibling);
                if (nextMenu.length > 0)
                    nextMenu.children('a').get(0).focus();
            }
            closeSubMenu();
        } else if (e.keyCode == 13) {
            var submenuId = e.currentTarget.id;
            var isMoreMenu = controller.selectedMenu === 'more_menu_item';
            var isBackButton = controller.clickHandlers.isBackButtonClick(submenuId);
            var isParentInMore = isMoreMenu && controller.clickHandlers.isMoreSubmenuParentClick(submenuId);

            if (isMoreMenu && isParentInMore) {
                var clickedElement = e.currentTarget;
                if (clickedElement) {
                    controller.moreSubmenuState.clickedElementPosition = clickedElement.getBoundingClientRect();
                }
            }

            controller.handleSubMenuClick(e);

            // Handle focus for More submenu keyboard navigation
            if (isMoreMenu && (isBackButton || isParentInMore)) {
                // Keep submenu open and focus on first item after navigation
                setTimeout(function() {
                    if (controller.showSubMenu && controller.selectedMenu === 'more_menu_item') {
                        controller.repositionMoreSubmenu();
                        var firstSubmenuItem = $('.submenu-container').find('.submenu-item a').get(0);
                        if (firstSubmenuItem) {
                            firstSubmenuItem.focus();
                        }
                    }
                }, 50);
                return; // Don't close submenu for More menu navigation
            }

            closeSubMenu();
        }
    }
    scope.$on('$destroy', function() {
        if (mqHover.removeEventListener) {
            mqHover.removeEventListener('change', updateHover);
            mqFine.removeEventListener('change', updateHover);
        } else if (mqHover.removeListener) {
            mqHover.removeListener(updateHover);
            mqFine.removeListener(updateHover);
        }
    });

    function closeSubMenu() {
        scope.$applyAsync(function() {
            controller.closeSubMenu();
        });
    }
}
