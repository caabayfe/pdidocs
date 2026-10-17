api.controller = function($scope, $rootScope, $location, $timeout, spModal, $window, spUtil, snAnalytics) {
    /* widget controller */
    var c = this;

    // Constants
    var CONSTANTS = {
        LAYOUT: {
            ITEM_HEIGHT_LEFT_NAV: 69,
            ITEM_MIN_WIDTH_BOTTOM_NAV: 75,
            CONTAINER_PADDING: 24,
            MOBILE_WIDTH_THRESHOLD: 767
        },
        MENU_ITEMS: {
            MORE_ITEM_ID: 'more_menu_item',
            BACK_BUTTON_ID: 'back_button_item'
        },
        TIMEOUTS: {
            RESIZE_DEBOUNCE: 200,
            SUBMENU_DELAY: 50,
            SUBMENU_CLOSE_DELAY: 500
        },
        SELECTORS: {
            MAIN_CONTAINER: '.main-container',
            MAIN_CONTAINER_MOBILE: '.main-container-mobile',
            SUBMENU_CONTAINER: '.submenu-container',
            PARENT_MENU_CONTAINER: '.parent-menu-container',
            ITEM_CONTAINER_MOBILE: '.item-container-mobile',
            SP_PAGE_ROOT: '.sp-page-root'
        },
        CSS_CLASSES: {
            HIDDEN_SUBMENU: 'hidden-submenu'
        }
    };

    c.selectedMenu = '';
    c.showSubMenu = false;
    $scope.isLoading = false;
    var prevSelectedMenu = '';
    var bottomMargin = 10;
    var spPageRoot = document.querySelector(CONSTANTS.SELECTORS.SP_PAGE_ROOT);
    var spPageRootWidth = spPageRoot.clientWidth;
    var submenuCloseTimeout;

    $scope.theme.navbar_fixed = true;
    if($scope.theme.footer_fixed){
        spPageRoot.classList.add('fixed-footer');
    }
    
    $timeout(function() {
        $('body').addClass('left-nav')
    }, 0);

    function updateLeftNavClasses(isMobile) {
        if (isMobile) {
            $('body').addClass('left-nav-mobile');
            $('body').removeClass('left-nav-desktop');
        } else {
            $('body').addClass('left-nav-desktop');
            $('body').removeClass('left-nav-mobile');
        }
    }

    // Overflow behavior variables
    c.visibleMenuItems = [];
    c.overflowMenuItems = [];
    c.moreMenuItem = {
        portal_nav_item: CONSTANTS.MENU_ITEMS.MORE_ITEM_ID,
        name: c.data.more_message,
        menu_icon: 'ellipsis-h',
        render_as: 'menu',
        isMoreItem: true
    };

    // Nested navigation state for More submenu
    c.moreSubmenuState = {
        currentLevel: 'root', // 'root' or 'child'
        currentParentItem: null,
        displayItems: [], // Items currently displayed in More submenu
        breadcrumb: [],
        clickedElementPosition: null
    };

    // Back button item for nested navigation
    c.backButtonItem = {
        portal_nav_item: CONSTANTS.MENU_ITEMS.BACK_BUTTON_ID,
        name: "${Back}",
        menu_icon: 'arrow-left',
        isBackButton: true
    };

    c.getMeasuredItemHeightForLeftNav = function() {
        var itemElements = document.querySelectorAll('.item-parent');
        if (itemElements && itemElements.length > 0) {
            var actualHeight = itemElements[0].getBoundingClientRect().height;
            return actualHeight > 0 ? actualHeight : CONSTANTS.LAYOUT.ITEM_HEIGHT_LEFT_NAV;
        }
        return CONSTANTS.LAYOUT.ITEM_HEIGHT_LEFT_NAV;
    };

    c.getMeasuredItemWidthForBottomNav = function() {
        var itemElements = document.querySelectorAll(CONSTANTS.SELECTORS.ITEM_CONTAINER_MOBILE);
        if (itemElements && itemElements.length > 0) {
            var actualWidth = itemElements[0].getBoundingClientRect().width;
            return actualWidth > 0 ? actualWidth : CONSTANTS.LAYOUT.ITEM_MIN_WIDTH_BOTTOM_NAV;
        }
        return CONSTANTS.LAYOUT.ITEM_MIN_WIDTH_BOTTOM_NAV;
    };

    /**
     * Calculate maximum items that can fit in left navigation
     * @param {number} containerHeight - Available container height
     * @returns {number} Maximum number of items that can fit
     */
    c.calculateMaxItemsForLeftNav = function(containerHeight) {
        var availableHeight = containerHeight - CONSTANTS.LAYOUT.CONTAINER_PADDING;
        var itemHeight = c.getMeasuredItemHeightForLeftNav();
        var maxItems = Math.floor(availableHeight / itemHeight);
        var totalItems = c.data.menuItems.length;

        return totalItems <= maxItems ? totalItems : Math.max(1, maxItems - 1);
    };

    /**
     * Calculate maximum items that can fit in bottom navigation
     * @param {number} containerWidth - Available container width
     * @returns {number} Maximum number of items that can fit
     */
    c.calculateMaxItemsForBottomNav = function(containerWidth) {
        var itemWidth = c.getMeasuredItemWidthForBottomNav();
        var maxPossibleItems = Math.floor(containerWidth / itemWidth);
        var totalItems = c.data.menuItems.length;

        return totalItems <= maxPossibleItems ? totalItems : Math.max(1, maxPossibleItems - 1);
    };

    /**
     * Calculate available space dynamically for current layout
     * @returns {number} Number of items that can be displayed without overflow
     */
    c.calculateAvailableSpace = function() {
        if (!c.data.menuItems || c.data.menuItems.length === 0) return 0;

        var container = $scope.showLeftNav ?
            document.querySelector(CONSTANTS.SELECTORS.MAIN_CONTAINER) :
            document.querySelector(CONSTANTS.SELECTORS.MAIN_CONTAINER_MOBILE);

        if (!container) return 0;
        if (container.clientHeight <= 0 || container.clientWidth <= 0) return 0;

        return $scope.showLeftNav ?
            c.calculateMaxItemsForLeftNav(container.clientHeight) :
            c.calculateMaxItemsForBottomNav(container.clientWidth);
    };

    // Utility functions for common DOM operations and helper functions
    c.domUtils = {
        toggleSubmenuVisibility: function(show) {
            var method = show ? 'removeClass' : 'addClass';
            $(CONSTANTS.SELECTORS.SUBMENU_CONTAINER)[method](CONSTANTS.CSS_CLASSES.HIDDEN_SUBMENU);
        }
    };

    // Calculate which items should be visible vs overflow
    c.calculateOverflowItems = function() {
        if (!c.data.menuItems || c.data.menuItems.length === 0) {
            c.visibleMenuItems = [];
            c.overflowMenuItems = [];
            return;
        }

        var maxVisibleItems = c.calculateAvailableSpace();
        var allMenuItems = c.data.menuItems.slice();

        // Sort by order to maintain proper sequence
        allMenuItems.sort(function(a, b) {
            return a.order - b.order;
        });

        // Ensure we have at least 1 item visible
        maxVisibleItems = Math.max(1, maxVisibleItems);

        if (allMenuItems.length <= maxVisibleItems) {
            // No overflow needed
            c.visibleMenuItems = allMenuItems;
            c.overflowMenuItems = [];
        } else {
            var visibleCount = maxVisibleItems;

            // Split items into visible and overflow
            c.visibleMenuItems = allMenuItems.slice(0, visibleCount);
            c.overflowMenuItems = allMenuItems.slice(visibleCount);

            // Add the "More" item to visible items if we have overflow
            if (c.overflowMenuItems.length > 0) {
                c.visibleMenuItems.push(c.moreMenuItem);
            }
        }

        // Initialize More submenu state when overflow items change
        c.initializeMoreSubmenuState();
    };

    // Initialize the More submenu state to show root level items
    c.initializeMoreSubmenuState = function() {
        c.moreSubmenuState.currentLevel = 'root';
        c.moreSubmenuState.currentParentItem = null;
        c.moreSubmenuState.displayItems = c.overflowMenuItems.slice();
        c.moreSubmenuState.breadcrumb = [];
        c.moreSubmenuState.clickedElementPosition = null;
    };

    // Navigate to child topics within More submenu
    c.navigateToChildTopics = function(parentItem, clickedElement) {
        if (!parentItem || !c.data.menuItemToChildrenMap[parentItem.portal_nav_item]) {
            return;
        }


        var childItems = c.data.menuItemToChildrenMap[parentItem.portal_nav_item];
        if (!childItems || childItems.length === 0) {
            return;
        }

        // Store clicked element position
        var submenuContainer = $(CONSTANTS.SELECTORS.SUBMENU_CONTAINER).get(0);
        if (submenuContainer && clickedElement) {
            c.moreSubmenuState.clickedElementPosition = clickedElement.getBoundingClientRect();
        }

        // Set up nested navigation state
        c.moreSubmenuState.currentLevel = 'child';
        c.moreSubmenuState.currentParentItem = parentItem;
        c.moreSubmenuState.breadcrumb.push({
            item: parentItem,
            displayItems: c.moreSubmenuState.displayItems.slice(),
            elementPosition: c.moreSubmenuState.clickedElementPosition
        });

        // Create display items with back button at the top
        c.moreSubmenuState.displayItems = [c.backButtonItem].concat(childItems);

    };

    // Navigate back to parent level in More submenu
    c.navigateBackInMoreSubmenu = function() {
        if (c.moreSubmenuState.breadcrumb.length === 0) {
            // Already at root, reset to root state
            c.initializeMoreSubmenuState();
            return;
        }

        // Pop the last breadcrumb entry
        var previousLevel = c.moreSubmenuState.breadcrumb.pop();

        if (c.moreSubmenuState.breadcrumb.length === 0) {
            // Back to root level
            c.moreSubmenuState.currentLevel = 'root';
            c.moreSubmenuState.currentParentItem = null;
            c.moreSubmenuState.displayItems = c.overflowMenuItems.slice();
            c.moreSubmenuState.clickedElementPosition = previousLevel.elementPosition;
        } else {
            // Back to previous parent level
            var currentBreadcrumb = c.moreSubmenuState.breadcrumb[c.moreSubmenuState.breadcrumb.length - 1];
            c.moreSubmenuState.currentParentItem = currentBreadcrumb.item;
            c.moreSubmenuState.displayItems = currentBreadcrumb.displayItems.slice();
            c.moreSubmenuState.clickedElementPosition = currentBreadcrumb.elementPosition;
        }
    };

    // Check if an item in More submenu has child topics
    c.hasChildTopicsInMore = function(menuItem) {
        if (!menuItem || c.selectedMenu != CONSTANTS.MENU_ITEMS.MORE_ITEM_ID || menuItem.isBackButton) return false;
        var childItems = c.data.menuItemToChildrenMap[menuItem.portal_nav_item];
        return childItems && childItems.length > 0;
    };

    // Initialize overflow calculation after data is available
    $scope.$watch('c.data.menuItems', function(newVal) {
        if (newVal && newVal.length > 0) {
            c.calculateOverflowItems();
        }
    });
    if (c.data.fetchTopicDataFromFlow && !$rootScope.getTopicsFlowInProgress) {
        if (c.data.skeletonView)
            $scope.isLoading = true;
        var isCompleted = false;
        var timeoutId;
        var executionId;
        $rootScope.getTopicsFlowInProgress = true;

        GlideFlow.startSubflow('sn_ex_sp.get_topics_data_for_user', c.data.flowInputs)
            .then(function(execution) {
                if (c.data.skeletonView) {
                    timeoutId = $timeout(function() {
                        if (!isCompleted) {
                            isCompleted = true;
                            $scope.isLoading = false;
                            spUtil.addErrorMessage('${There was a problem with loading the menu. Please try again later.}');
                            $rootScope.getTopicsFlowInProgress = false;
                            c.data.cancelFlow = true;
                            c.data.executionId = execution.getExecutionId();
                            c.server.update();
                        }
                    }, c.data.async_timeout);
                }

                return execution.awaitCompletion();
            }, errorResolver)
            .then(function(completion) {
                $rootScope.getTopicsFlowInProgress = false;
                if (c.data.skeletonView) {
                    if (isCompleted) return;
                    isCompleted = true;
                    $scope.isLoading = false;
                    $timeout.cancel(timeoutId);
                }
                var outputs = completion.outputs;
                c.data.updateTopicDataFromFlow = true;
                c.data.topicDataFromFlow = outputs.topicsdata;
                c.server.update().then(function() {
                    // Calculate overflow after data is updated
                    c.calculateOverflowItems();
                });
            }, errorResolver);
    }

    c.cancelSubmenuClose = function() {
        // Clear any pending close timeout when hovering back over menu or submenu
        if (submenuCloseTimeout) {
            $timeout.cancel(submenuCloseTimeout);
            submenuCloseTimeout = null;
        }
    };

    c.toggleSubMenu = function(event) {
        // Clear any pending close timeout
        if (submenuCloseTimeout) {
            $timeout.cancel(submenuCloseTimeout);
        }
        var currentSelectedMenuItem = event.currentTarget.getAttribute('id');

        if (currentSelectedMenuItem == c.selectedMenu)
            return;

        // Handle "More" menu item special case for hover
        if (currentSelectedMenuItem === 'more_menu_item') {
            // Initialize More submenu state to show root level
            c.initializeMoreSubmenuState();
            // Set up overflow items as children before opening submenu
            c.data.menuItemToChildrenMap['more_menu_item'] = c.moreSubmenuState.displayItems;
        }

        c.closeSubMenu();
        $timeout(function() {
            c.openSubMenu(event);
        }, CONSTANTS.TIMEOUTS.SUBMENU_DELAY);
    };

    c.checkHoveredElement = function(menu, event) {
        if (!menu || menu.render_as == 'menu') {
            var hoveredElement = event.relatedTarget;
        if (c.selectedMenu === 'more_menu_item' && c.moreSubmenuState.currentLevel === 'child') {
            return;
        }
            if (!c.isElementPartOfMenu(hoveredElement)) {
                if (submenuCloseTimeout) {
                    $timeout.cancel(submenuCloseTimeout);
                }
                submenuCloseTimeout = $timeout(function() {
                    c.closeSubMenu();
                }, CONSTANTS.TIMEOUTS.SUBMENU_CLOSE_DELAY);
            }
        }
        $(event.currentTarget).tooltip('hide');
    };

    c.handleMenuClick = function(event) {
        event.stopPropagation();
        var menuId = event.currentTarget.getAttribute('id');
        var menu = getMenuItem(menuId);
        var target = 'Internal',
            url = '';
        var label = menu.name ? menu.name : menu.label;
        // Handle "More" menu click
        if (menuId === 'more_menu_item') {
            // Initialize More submenu state to show root level
            c.initializeMoreSubmenuState();
            // Set up overflow items as children before opening submenu
            c.data.menuItemToChildrenMap['more_menu_item'] = c.moreSubmenuState.displayItems;

            if (c.showSubMenu && c.selectedMenu === 'more_menu_item') {
                c.closeSubMenu();
            } else {
                c.openSubMenu(event, c.moreMenuItem);
            }
            return;
        }

        if (menu.render_as == 'modal_window' && menu.widget) {
            c.selectedMenu = menu.portal_nav_item;
            spModal.open({
                title: menu.name ? menu.name : menu.label,
                size: 'lg',
                widget: menu.widget,
                widgetInput: menu.widget_parameters,
                buttons: [{
                    label: '${Close}',
                    primary: true
                }]
            });
        } else if (menu.render_as == 'menu') {

            //if clicked on already open menu
            if (c.showSubMenu && c.selectedMenu == menu.portal_nav_item)
                c.closeSubMenu();
            else {
                if (!c.data.menuItemToChildrenMap[menu.portal_nav_item]) {
                    c.selectedMenu = menu.portal_nav_item;
                    url = getURL(menu);
                    target = menu.url_target && menu.url_target == '_blank' ? 'External' : 'Internal';
                    redirectToMenuItemPage(menu);
                } else
                    c.openSubMenu(event, menu);
            }
        }
        raiseAppseeEvent(label, target, url);
    }

	c.closeSubMenu = function() {
        c.showSubMenu = false;
        c.selectedMenu = '';
        var subMenu = $('.submenu-container');
        subMenu.addClass('hidden-submenu');
        subMenu.css({'left':'','top':'','bottom':''});
    }

    // Reposition More submenu based on stored element position
    c.repositionMoreSubmenu = function() {
        if (c.selectedMenu !== CONSTANTS.MENU_ITEMS.MORE_ITEM_ID || !c.moreSubmenuState.clickedElementPosition) {
            return;
        }

        var windowHeight = $window.innerHeight;
        var subMenuContainer = $(CONSTANTS.SELECTORS.SUBMENU_CONTAINER);
        var subMenuContainerElement = subMenuContainer.get(0);
        if (!subMenuContainerElement) return;

        if ($scope.showLeftNav) {
            var topCoordinate = $(CONSTANTS.SELECTORS.PARENT_MENU_CONTAINER).get(0).getBoundingClientRect().top + 24;
            var clickedElementTop = c.moreSubmenuState.clickedElementPosition.top;
            var subMenutopCoordinate = 24 + (clickedElementTop - topCoordinate);

            var subMenuHeight = subMenuContainerElement.getBoundingClientRect().height;
            var availableSubmenuSpace = windowHeight - clickedElementTop - bottomMargin;

            //if subMenu overflows below the page
            if (subMenuHeight > availableSubmenuSpace) {
                var difference = subMenuHeight - availableSubmenuSpace;
                subMenutopCoordinate = clickedElementTop > difference ? Math.floor(subMenutopCoordinate - difference) : topCoordinate - 24;
            }
            subMenuContainer.css('top', subMenutopCoordinate + 'px');
        } else {
            // For mobile, keep same positioning logic
            var navbarHeight = document
                .querySelector(CONSTANTS.SELECTORS.ITEM_CONTAINER_MOBILE)
                .getBoundingClientRect().height;
            var subMenuPadding = 8;
            var clickedElementLeft = c.moreSubmenuState.clickedElementPosition.left;
            var submenuW = subMenuContainerElement.offsetWidth;
            var currentPageWidth = spPageRoot.clientWidth;
            var optimalLeft = Math.max(subMenuPadding, Math.min(clickedElementLeft, currentPageWidth - submenuW - subMenuPadding));
            
            subMenuContainer.css('bottom', (navbarHeight || 69) + 1 + 'px');
            subMenuContainer.css('left', optimalLeft + 'px');
        }
    };

    c.openSubMenu = function(event, menu) {

        if (!menu)
            menu = getMenuItem(event.currentTarget.getAttribute('id'));
        var element = event.currentTarget;
        var childrenSubMenuItems = c.data.menuItemToChildrenMap[menu.portal_nav_item];

        if (menu.render_as == 'menu' && childrenSubMenuItems && childrenSubMenuItems.length > 0) {

            $scope.$applyAsync(function() {
                c.selectedMenu = menu.portal_nav_item;
                c.showSubMenu = true;
            });

            //calculate top coordinate of submenu  	
            $timeout(function() {
                var windowHeight = $window.innerHeight;
                var subMenuContainer = $(CONSTANTS.SELECTORS.SUBMENU_CONTAINER);
                if ($scope.showLeftNav) {
                    var topCoordinate = $(CONSTANTS.SELECTORS.PARENT_MENU_CONTAINER).get(0).getBoundingClientRect().top + 24;
                    var menuTopCoordinate = element.getBoundingClientRect().top;
                    var subMenuContainerElement = $(CONSTANTS.SELECTORS.SUBMENU_CONTAINER).get(0);
                    var subMenutopCoordinate = 24 + (menuTopCoordinate - topCoordinate);
                    c.domUtils.toggleSubmenuVisibility(true);

                    var subMenuHeight = subMenuContainerElement.getBoundingClientRect().height;
                    var availableSubmenuSpace = windowHeight - menuTopCoordinate - bottomMargin;

                    //if subMenu overflows below the page
                    if (subMenuHeight > availableSubmenuSpace) {
                        var difference = subMenuHeight - availableSubmenuSpace;
                        subMenutopCoordinate = menuTopCoordinate > difference ? Math.floor(subMenutopCoordinate - difference) : topCoordinate - 24;
                    }
                    subMenuContainer.css('top', subMenutopCoordinate + 'px');
                } else {
                    var submenuEl = document.querySelector(CONSTANTS.SELECTORS.SUBMENU_CONTAINER);
                    if (!submenuEl) return;

                    // Set initial position to avoid flash
                    var navbarHeight = document
                        .querySelector(CONSTANTS.SELECTORS.ITEM_CONTAINER_MOBILE)
                        .getBoundingClientRect().height;
                    subMenuContainer.css('bottom', (navbarHeight || 69) + 1 + 'px');
                    subMenuContainer.css('left', '0px');

                    // Delay to ensure DOM updates and accurate width calculation
                    $timeout(function() {
                        var subMenuPadding = 8;
                        var menuLeftCoordinate = event.currentTarget.getBoundingClientRect().left;
                        var submenuW = submenuEl.offsetWidth;

                        // Get current window width dynamically for accurate positioning after resize
                        var currentPageWidth = spPageRoot.clientWidth;

                        // Calculate optimal left position to prevent cutoff
                        var optimalLeft = Math.max(subMenuPadding, Math.min(menuLeftCoordinate, currentPageWidth - submenuW - subMenuPadding));
                        
                        subMenuContainer.css('bottom', (navbarHeight || 69) + 1 + 'px');
                        subMenuContainer.css('left', optimalLeft + 'px');
                    }, 10);
                }
            });
        }
    };

    c.hasURL = function(menu) {
        if (menu.type != 'topic' && menu.href == '')
            return false;
        return true;
    };

    c.getTooltip = function(menu) {
        if (menu.render_as != 'menu' || !c.data.menuItemToChildrenMap[menu.portal_nav_item])
            return menu.name ? menu.name : menu.label;
    };

    c.isSubmenuHeading = function(submenu) {
        return submenu.parent_nav_item == null &&
            (c.selectedMenu !== 'more_menu_item' || c.moreSubmenuState.currentLevel === 'child');
    };

    c.hasSubMenu = function(menu) {
        if (menu.isMoreItem) {
            return c.overflowMenuItems && c.overflowMenuItems.length > 0;
        }
        return c.data.menuItemToChildrenMap[menu.portal_nav_item] && c.data.menuItemToChildrenMap[menu.portal_nav_item].length > 0;
    };

    c.getHeight = function() {
        if ($scope.showLeftNav) {
            var height = $('body').height() - $('header').height();
            return {
                'height': height + 'px'
            };
        }
    };

    c.getSubMenuHeight = function() {
        var height;
        var zoom = getBrowserZoomLevel();
        var header = $('header');
        var headerHeight = header.height();
        
        // Check if header is scrolled out of view at high zoom levels
        var isHeaderVisible = true;
        if (zoom >= ZOOM_HIDE_THRESHOLD && header.length > 0) {
            var headerRect = header.get(0).getBoundingClientRect();
            isHeaderVisible = headerRect.bottom > 0;
        }
        
        if($scope.showLeftNav) {
            // For left nav, use full height if header is not visible at high zoom
            if (!isHeaderVisible) {
                height = $window.innerHeight - bottomMargin;
            } else {
                height = $('body').height() - headerHeight - bottomMargin;
            }
        } else {
            // For mobile/bottom nav
            if (!isHeaderVisible) {
                height = $window.innerHeight - $('.main-container-mobile').height();
            } else {
                height = $('body').height() - headerHeight - $('.main-container-mobile').height();
                if (height < 100) {
                    height = $('body').height() - $('.main-container-mobile').height();
                }
            }
        }
        return {'max-height' : height + 'px'};
    };


    // Click handler utility functions
    c.clickHandlers = {
        /**
         * Check if click is on back button in More submenu
         * @param {string} submenuId - ID of clicked item
         * @returns {boolean} Whether this is a back button click
         */
        isBackButtonClick: function(submenuId) {
            return submenuId === CONSTANTS.MENU_ITEMS.BACK_BUTTON_ID &&
                c.selectedMenu === CONSTANTS.MENU_ITEMS.MORE_ITEM_ID;
        },

        /**
         * Check if click is on parent item with children in More submenu
         * @param {string} submenuId - ID of clicked item
         * @returns {boolean} Whether this is a parent item click
         */
        isMoreSubmenuParentClick: function(submenuId) {
            if (c.selectedMenu !== CONSTANTS.MENU_ITEMS.MORE_ITEM_ID) return false;

            var clickedItem = getSubmenuItemById(submenuId);
            return clickedItem && c.hasChildTopicsInMore(clickedItem) &&
                c.moreSubmenuState.currentLevel === 'root';
        },

        /**
         * Handle back button click in More submenu
         * @param {Event} event - Click event
         */
        handleBackButtonClick: function(event) {
            event.stopPropagation();
            event.preventDefault();

            c.navigateBackInMoreSubmenu();
            c.data.menuItemToChildrenMap[CONSTANTS.MENU_ITEMS.MORE_ITEM_ID] = c.moreSubmenuState.displayItems;

            // Keep submenu open after back navigation
            c.showSubMenu = true;
            c.selectedMenu = CONSTANTS.MENU_ITEMS.MORE_ITEM_ID;

            $timeout(function() {
                c.showSubMenu = true;
                c.selectedMenu = CONSTANTS.MENU_ITEMS.MORE_ITEM_ID;
                c.domUtils.toggleSubmenuVisibility(true);
                c.repositionMoreSubmenu();
            }, 0);
        },

        /**
         * Handle parent item click in More submenu
         * @param {Event} event - Click event
         * @param {string} submenuId - ID of clicked item
         */
        handleMoreSubmenuParentClick: function(event, submenuId) {
            event.stopPropagation();
            event.preventDefault();

            var clickedItem = getSubmenuItemById(submenuId);
            var clickedElement = event.currentTarget;
            c.navigateToChildTopics(clickedItem, clickedElement);
            c.data.menuItemToChildrenMap[CONSTANTS.MENU_ITEMS.MORE_ITEM_ID] = c.moreSubmenuState.displayItems;

            // Keep submenu open
            c.showSubMenu = true;
            c.selectedMenu = CONSTANTS.MENU_ITEMS.MORE_ITEM_ID;

            $timeout(function() {
                c.showSubMenu = true;
                c.selectedMenu = CONSTANTS.MENU_ITEMS.MORE_ITEM_ID;
                c.domUtils.toggleSubmenuVisibility(true);
                c.repositionMoreSubmenu();
            }, 0);
        },

        /**
         * Handle regular submenu item click
         * @param {Event} event - Click event
         * @param {string} submenuId - ID of clicked item
         */
        handleRegularSubmenuClick: function(event, submenuId) {
            var submenu = getSubmenuItemById(submenuId);
            var target = submenu.url_target && submenu.url_target == '_blank' ? 'External' : 'Internal';
            var url = getURL(submenu);
            var label = submenu.name ? submenu.name : submenu.label;
            raiseAppseeEvent(label, target, url);

            // Handle modal windows
            if (submenu.render_as == 'modal_window' && submenu.widget) {
                c.selectedMenu = submenu.portal_nav_item;
                spModal.open({
                    title: label,
                    size: 'lg',
                    widget: submenu.widget,
                    widgetInput: submenu.widget_parameters,
                    buttons: [{
                        label: '${Close}',
                        primary: true
                    }]
                });
                $timeout(function() {
                    c.closeSubMenu();
                });
                return;
            }

            if (!c.hasURL(submenu)) return;

            $timeout(function() {
                c.closeSubMenu();
            });

            if (event.ctrlKey || event.metaKey) return;

            redirectToMenuItemPage(submenu);
        }

    };

    /**
     * Main submenu click handler - delegates to specific handlers
     * @param {Event} event - Click event
     */
    c.handleSubMenuClick = function(event) {
        var submenuId = event.currentTarget.id;

        if (c.clickHandlers.isBackButtonClick(submenuId)) {
            return c.clickHandlers.handleBackButtonClick(event);
        }

        if (c.clickHandlers.isMoreSubmenuParentClick(submenuId)) {
            return c.clickHandlers.handleMoreSubmenuParentClick(event, submenuId);
        }

        return c.clickHandlers.handleRegularSubmenuClick(event, submenuId);
    };

    $scope.mobileDevice = spPageRootWidth <= CONSTANTS.LAYOUT.MOBILE_WIDTH_THRESHOLD;
    $scope.showLeftNav = !$scope.mobileDevice;
    $scope.showBottomNav = $scope.mobileDevice;
    updateLeftNavClasses($scope.mobileDevice);

    // Listen to screen resizing or header updates
    $rootScope.$on('isHeaderInMobileView', function(event, isMobileView) {
        $scope.mobileDevice = isMobileView;
        updateNavigationLayout();
        // Wait for DOM to update after layout changes before calculating overflow
        $timeout(function() {
	    updateMobileNavWidth();
            c.calculateOverflowItems();
            updateLeftNavClasses($scope.mobileDevice);
        }, CONSTANTS.TIMEOUTS.SUBMENU_DELAY);
    });

    function updateNavigationLayout() {
        var isMobile = $scope.mobileDevice || $scope.showMobileMenuOnDesktop;
        $scope.showLeftNav = !isMobile;
        $scope.showBottomNav = isMobile;
    }

    // Update mobile nav width to match spPageRoot
    function updateMobileNavWidth() {
        if (!$scope.showBottomNav) return;
        
        var navContainerMobile = document.querySelector('.nav-container-mobile');
        if (navContainerMobile && spPageRoot) {
            navContainerMobile.style.width = spPageRoot.clientWidth + 'px';
        }
    }

    // Resize listener for responsive overflow calculation
    var resizeTimeout;

    // ResizeObserver callback function
    function handleResize() {
        $timeout.cancel(resizeTimeout);
        resizeTimeout = $timeout(function() {
            updateMobileNavWidth();
            c.calculateOverflowItems();
            bind();
            toggleBottomNav(false);
            $scope.$apply();
        }, CONSTANTS.TIMEOUTS.RESIZE_DEBOUNCE);
    }

    if (window.ResizeObserver) {
        var resizeObserver = new ResizeObserver(handleResize);
        if (spPageRoot) {
            resizeObserver.observe(spPageRoot);
        }
    }

    // To detect text-only zoom - monitor font size changes
    var fontSize = getComputedStyle(document.documentElement).fontSize;
    var textZoomInterval = setInterval(function() {
        var currentFontSize = getComputedStyle(document.documentElement).fontSize;
        if(fontSize !== currentFontSize) {
            fontSize = currentFontSize;
            // Recalculate overflow items when text-only zoom changes
            $timeout(function() {
                c.calculateOverflowItems();
                bind();
                toggleBottomNav(false);
            }, CONSTANTS.TIMEOUTS.RESIZE_DEBOUNCE);
        }
    }, 500);

    // Clean up text-only zoom detection on widget destroy
    var destroyListener = $scope.$on('$destroy', function() {
        if (textZoomInterval) {
            clearInterval(textZoomInterval);
        }
    });

    // On widget load - initialize immediately
    updateNavigationLayout();

    // Initialize overflow calculation immediately if data is available
    if (c.data.menuItems && c.data.menuItems.length > 0) {
        c.calculateOverflowItems();
    }

    $scope.$on('ngRepeatMenuFinished', function() {
        createURLMap();
        highlightMenuItem();
        c.calculateOverflowItems();
    });

    $scope.$on('$locationChangeSuccess', function() {
        removeSelectedClass();
        highlightMenuItem();
    });

    c.isElementPartOfMenu = function(element) {
        var subMenuContainerElement = $(CONSTANTS.SELECTORS.SUBMENU_CONTAINER).get(0);
        var partOfSubMenu = subMenuContainerElement.contains(element);
        return partOfSubMenu;
    };

    function redirectToMenuItemPage(menuItem) {
        var searchString = getRedirectSearchParams(menuItem);
        if (menuItem.type === "url") {
            var url_target = menuItem.url_target || "_self";
            if (menuItem.href[0] === "#") {
                var currentUrl = $location.url();
                var newUrl = (currentUrl.indexOf('#') === -1) ? currentUrl : currentUrl.split('#')[0];
                $location.url(newUrl + menuItem.href);
                return;
            }
            $window.open(menuItem.href, url_target);
        } else {
            var currentHash = $location.hash();
            if (currentHash) {
                $location.hash('');
            }
            $location.path('/' + c.data.portalSuffix).search(searchString);
        }
        if (menuItem.type !== "url" || menuItem.url_target != "_blank")
            addSelectedClass(getMenuItem(c.selectedMenu));
    }

    function createURLMap() {
        c.URLMap = {};

        for (var i in c.data.menuItems) {
            var menu = c.data.menuItems[i];
            if (menu.portal_nav_item != c.data.homeMenuItem && menu.render_as != 'modal_window' && !c.data.menuItemToChildrenMap[menu.portal_nav_item]) {
                var url = getURL(menu);
                if (url != '' && !c.URLMap[url])
                    c.URLMap[url] = menu.portal_nav_item;
            }
        }

        for (var i in c.data.menuItemToChildrenMap) {
            var subMenuItems = c.data.menuItemToChildrenMap[i];
            for (var j in subMenuItems) {
                var subMenu = subMenuItems[j];
                var url = getURL(subMenu);
                if (url != '' && !c.URLMap[url])
                    c.URLMap[url] = i;
            }
        }
    }

    function getURL(menu) {
        var url = getRedirectSearchParams(menu);
        if (menu.type == 'url') {
            if (menu.href[0] === "#") {
                var currentUrl = $location.url();
                var newUrl = (currentUrl.indexOf('#') === -1) ? currentUrl : currentUrl.split('#')[0];
                url = newUrl + menu.href;
            } else
                url = menu.href;
        }
        return url;
    }

    function getRedirectSearchParams(menuItem) {
        // Checking if menu item belongs to a taxonomy. If so, then redirect to topic page else, redirect to href.
        var pageToRedirect = menuItem.template && menuItem.template.length > 0 ? menuItem.template : 'emp_taxonomy_topic';
        var searchString = menuItem.taxonomy ? "id=" + pageToRedirect + "&topic_id=" + menuItem.sys_id : (menuItem.href ? menuItem.href.substring(1) : '');

        return searchString;
    }

    function highlightMenuItem() {
        if (c.data.menuItems && c.data.menuItems.length > 0 && isHomePage()) {
            var homeMenuItem = getMenuItem(c.data.homeMenuItem);
            if (homeMenuItem) {
                addSelectedClass(homeMenuItem);
                return;
            }
        }
        var currURL = $window.location.href;
        for (var i in c.URLMap) {
            if (currURL == i || currURL.endsWith(i)) {
                var menuItem = getMenuItem(c.URLMap[i]);
                addSelectedClass(menuItem);
                return;
            }
        }
    }


    function errorResolver(error) {
        $rootScope.getTopicsFlowInProgress = false;
        if (c.data.skeletonView) {
            $scope.isLoading = false;
            if (isCompleted) return;
            isCompleted = true;
            $timeout.cancel(timeoutId);
        }
    }

    function getMenuItem(id) {
        // Handle "More" menu item
        if (id === 'more_menu_item') {
            return c.moreMenuItem;
        }

        for (var i in c.data.menuItems) {
            var menu = c.data.menuItems[i];
            if (menu.portal_nav_item == id)
                return menu;
        }
    }

    // Helper function to get submenu item by ID from current display items
    function getSubmenuItemById(submenuId) {
        if (c.selectedMenu === 'more_menu_item') {
            // Look in current display items for More submenu
            for (var i = 0; i < c.moreSubmenuState.displayItems.length; i++) {
                var item = c.moreSubmenuState.displayItems[i];
                if (item.portal_nav_item === submenuId) {
                    return item;
                }
            }
        }

        // Fall back to regular submenu lookup
        var subMenuData = c.data.menuItemToChildrenMap[c.selectedMenu];
        if (!subMenuData) return null;

        for (var j = 0; j < subMenuData.length; j++) {
            var subMenu = subMenuData[j];
            if (subMenu.portal_nav_item === submenuId) {
                return subMenu;
            }
        }
        return null;
    }

    function isHomePage() {
        var menu = getMenuItem(c.data.homeMenuItem);
        var currURL = $window.location.href;
        var suffix = c.data.portalSuffix;
        return currURL.endsWith(suffix) || currURL.indexOf(suffix + '?id=' + c.data.homepage) != -1;
    }

    function removeSelectedClass() {
        if (prevSelectedMenu != '') {
            getMenuItem(prevSelectedMenu).selected = false;
            prevSelectedMenu = '';
        }
    }

    function addSelectedClass(menu) {
        removeSelectedClass();
        menu.selected = true;
        prevSelectedMenu = menu.portal_nav_item;
    }

    // Handle 400% zoom accessibility
    var SCROLL_THRESHOLD = 5;
    var SCROLL_THROTTLE_DELAY = 16;
    var ZOOM_HIDE_THRESHOLD = 400;
    var BOTTOM_NAV_SELECTOR = '.nav-container-mobile';
    var SUBMENU_SELECTOR = '.submenu-container';

    var lastScrollTop = 0;
    var scrollDirection = null;
    var isBottomNavHidden = false;
    var scrollTimeout = null;

    var $doc = angular.element(document);

    function getBrowserZoomLevel() {
        return Math.round((window.outerWidth / window.innerWidth) * 100);
    }

    function isSubmenuVisible() {
        var submenuContainer = $(SUBMENU_SELECTOR);
        return submenuContainer.length > 0 && !submenuContainer.hasClass('hidden-submenu');
    }

    function toggleBottomNav(shouldHide) {
        if (shouldHide === isBottomNavHidden || !$scope.showBottomNav) return;

        var $bottomNav = $(BOTTOM_NAV_SELECTOR);
        if ($bottomNav.length === 0) return;

        $bottomNav.toggleClass('bottom-nav-hidden', shouldHide);
        isBottomNavHidden = shouldHide;
    }

    function getScrollContainer() {        
        if (spPageRoot) {
            var rootScrollTop = spPageRoot.scrollTop;
            var rootScrollHeight = spPageRoot.scrollHeight;
            var rootClientHeight = spPageRoot.clientHeight;
            
            if (rootScrollHeight > rootClientHeight || rootScrollTop > 0) {
                return {
                    scrollTop: rootScrollTop,
                    scrollHeight: rootScrollHeight,
                    clientHeight: rootClientHeight
                };
            }
        }

        // Fallback to window
        return {
            scrollTop: window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop,
            scrollHeight: document.documentElement.scrollHeight || document.body.scrollHeight,
            clientHeight: window.innerHeight
        };
    }

    function isAtBottomOfPage() {
        var container = getScrollContainer();
        var threshold = 10;
        return container.scrollTop + container.clientHeight >= container.scrollHeight - threshold;
    }

    function detectScrollDirection(e) {
        if (e.type === 'wheel') {
            var deltaY = e.originalEvent.deltaY;
            var deltaX = e.originalEvent.deltaX;

            if (Math.abs(deltaY) > Math.abs(deltaX)) {
                scrollDirection = deltaY > 0 ? 'down' : 'up';
                return true;
            }
        }

        if (e.type === 'touchmove') {
            var container = getScrollContainer();
            var currentScrollTop = container.scrollTop;
            var isVertical = Math.abs(currentScrollTop - lastScrollTop) > SCROLL_THRESHOLD;

            if (isVertical) {
                scrollDirection = currentScrollTop > lastScrollTop ? 'down' : 'up';
                lastScrollTop = currentScrollTop;
                return true;
            }
        }

        return false;
    }

    function handleKeyScroll(e) {
        var verticalKeys = {
            ArrowDown: 'down',
            PageDown: 'down',
            ' ': 'down',
            ArrowUp: 'up',
            PageUp: 'up'
        };

        if (!verticalKeys[e.key]) return;

        scrollDirection = verticalKeys[e.key];
        var zoom = getBrowserZoomLevel();

        if (zoom >= ZOOM_HIDE_THRESHOLD && !c.showSubMenu) {
            var atBottom = isAtBottomOfPage();
            if (scrollDirection === 'down') {
                toggleBottomNav(!atBottom);
            } else {
                toggleBottomNav(false);
            }
        }
    }

    function throttledScrollHandler(e) {
        if (scrollTimeout) {
            return;
        }

        if (!detectScrollDirection(e)) {
            return;
        }
        scrollTimeout = setTimeout(function() {
            var zoom = getBrowserZoomLevel();
            if (zoom >= ZOOM_HIDE_THRESHOLD && !isSubmenuVisible()) {
                var atBottom = isAtBottomOfPage();
                if (scrollDirection === 'down') {
                    toggleBottomNav(!atBottom);
                } else {
                    toggleBottomNav(false);
                }
            }
            scrollTimeout = null;
        }, SCROLL_THROTTLE_DELAY);
    }


    function bind() {
        $doc.on('wheel touchmove', throttledScrollHandler);
        $doc.on('keydown', handleKeyScroll);
    }

    function unbind() {
        $doc.off('wheel touchmove', throttledScrollHandler);
        $doc.off('keydown', handleKeyScroll);

        if (scrollTimeout) {
            clearTimeout(scrollTimeout);
            scrollTimeout = null;
        }
    }

    // Cleanup on destroy
    $scope.$on('$destroy', unbind);

    function raiseAppseeEvent(label, link_type, url) {
        var payload = {};
        payload.name = "Side Navigation Analytics";
        payload.data = {};
        payload.data["User id"] = c.data.userID;
        payload.data["User name"] = c.data.userName;
        payload.data["Item clicked"] = label;
        payload.data["Link type"] = link_type;
        payload.data["URL"] = url;
        payload.data["Session"] = c.data.sessionID;
        payload.data["Device"] = c.data.isMobile ? 'Mobile' : 'Desktop';
        snAnalytics.addEvent(payload);
    }

};
