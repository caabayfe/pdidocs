api.controller = function($scope, $rootScope, $location, $timeout, $window, $anchorScroll, spModal, spUtil, snAnalytics, i18n) {
    var c = this;
    c.SUB_NAVBAR_HEIGHT = 51;
    c.SIMPLE_MENU_WIDTH = 268;
    c.MOBILE_DEVICE_SCREEN_WIDTH = 767;
    c.MEGA_MENU_ITEMS_PADDING = 24;
    c.GRID_ITEM_PADDING_RIGHT = 24;
    c.GRID_ROW_GAP = 20;
    c.MEGA_MENU_MAX_WIDTH = 1430;
    c.MAX_BUTTON_WIDTH = 288;
    c.DELTA_OFFSET = 24;
    c.IE_PREFIX = 'Trident/';
    c.isIE = (window.navigator.userAgent.indexOf(c.IE_PREFIX) !== -1);

    c.DEFAULT_FONT_SIZE = 16;
    c.textZoomFactor = 1;
    c.tabWidth = 208;
    c.minMegaMenuWidth = 400;


    // Events fired from/to $rootScope for responsive mobile view.
    c.SHOW_MOBILE_MEGA_MENU = 'showMobileMegaMenu';
    c.SHOW_MOBILE_MENU_ON_DESKTOP = 'showMobileMenuOnDesktop';
    c.TOGGLE_MOBILE_MENU_VISIBILITY = 'toggleMobileMenuVisibility';

    // Below 2 scope variables (showMegaMenu & selectedMenuItem) are used together to show simple/mega menu.
    $scope.showMegaMenu = false;
    $scope.selectedMenuItem = undefined;
    $scope.megaMenuPosition = undefined;
    $scope.megaMenuLeftOffset = undefined;
    $scope.levelOneTopicsWithNoChildren = [];
    $scope.selectedMenuItemRightCoordinate = 0;
    $scope.showMenuOnLeft = false;
    $scope.showMenu = false;

    // This value is computed after the grid layout is complete based on type (single-column, 2-column, orphan-list) of items present in the grid.
    c.gridItemWidth = 0;

    // Below 2 boolean scope variables are set to true in mutually exclusive manner based on how grid item width is computed after layout
    c.usedOrphansColumnForGridItemWidth = false;
    c.allGridItemsHaveTwoColumns = false;

    /* We set this to false when we encounter 2-column grid item while resizing each item & use it to prevent executing
    the logic to fill vertical gaps formed due to presence of 2-column grid items */
    c.allGridItemsHaveSingleColumn = true;

    /* Below 2 scope variables (showMobileMenuOnDesktop, showMobileMegaMenu) have counterparts in EC Header widget also.
     So whenever we set these variables, make sure to emit an event on rootScope to update them in the former widget as well. */
    $scope.showMobileMenuOnDesktop = false;
    /* showMobileMegaMenu, isLevelOneMobileMegaMenu are used together. If showMobileMegaMenu is true and
    isLevelOneMobileMegaMenu is false it means we are currently viewing level 2 subtopics in mobile mega menu */
    $scope.showMobileMegaMenu = false;
    $scope.isLevelOneMobileMegaMenu = false;
    $scope.selectedMobileMenuItem = undefined;
    $scope.levelOneSelectedMobileMenuItem = undefined;
    $scope.lastSelectedElementId = undefined;
    $scope.isWindowResized = false;
    $scope.isLoading = false;
    $scope.isMobileView = $rootScope.isHeaderInMobileView || c.data.isMobile || ($('.sp-page-root').width() <= c.MOBILE_DEVICE_SCREEN_WIDTH);

    /**
     * Used for capturing positions of columns in the mega menu:
     * masonry layout.
     * navigationMap : an object with key as left offset in pixel & value as array
     */
    $scope.navigationMap = {};
    $scope.keyboardNavRowIndex = 0;
    $scope.keyboardNavColIndex = 0;

    if (c.data.fetchTopicDataFromFlow && !$rootScope.getTopicsFlowInProgress) {
      if(c.data.skeletonView)
        $scope.isLoading = true;
      var isCompleted = false;
      var timeoutId;
      var executionId;
      $rootScope.getTopicsFlowInProgress = true;

      GlideFlow.startSubflow('sn_ex_sp.get_topics_data_for_user', c.data.flowInputs)
        .then(function (execution) {
        if(c.data.skeletonView){
          timeoutId = $timeout(function () {
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
        .then(function (completion) {
        $rootScope.getTopicsFlowInProgress = false;
        if(c.data.skeletonView){
          if (isCompleted) return;
          isCompleted = true;
          $timeout.cancel(timeoutId);
          $scope.isLoading = false;
        }
        var outputs = completion.outputs;
        c.data.updateTopicDataFromFlow = true;
        c.data.topicDataFromFlow = outputs.topicsdata;
        c.server.update();
      }, errorResolver);
    }

    function errorResolver(error) {
      $rootScope.getTopicsFlowInProgress = false;
      if(c.data.skeletonView){
        $scope.isLoading = false;
        if (isCompleted) return;
        isCompleted = true;
        $timeout.cancel(timeoutId);
      }
    }
    
    /**
     * This function provides keyboard navigation within mega menu
     *
     * @param {Object} event - keyboard event object
     * @see {@link c.initialiseKeyboardNav}
     * @todo change event.which to event.key after end of support for IE11.
     */
    $scope.handleMegaMenuKeyboardEvent = function(event) {
        event.preventDefault();
        var navIndex = Object.keys($scope.navigationMap);
        switch (event.which) {
            case 32: //fall through, click on space or enter key
            case 13:
                $(event.target).click();
                break;
            case 38:
                if (!$(event.target).hasClass("browse-button")) {
                    //if not on 1st row, move up a row
                    if ($scope.keyboardNavRowIndex != 0) {
                        $scope.keyboardNavRowIndex--;
                    } else if ($scope.keyboardNavRowIndex === 0) { //if on top most link, set it to last link of the column
                        $scope.keyboardNavRowIndex = $scope.navigationMap[navIndex[$scope.keyboardNavColIndex]].length - 1;
                    }
                }
                break;
            case 40:
                if (!$(event.target).hasClass("browse-button")) {
                    // if not on last row, move down one row
                    if ($scope.keyboardNavRowIndex + 1 !== $scope.navigationMap[navIndex[$scope.keyboardNavColIndex]].length)
                        $scope.keyboardNavRowIndex++;
                    // if on last row, go to 1st row
                    else if ($scope.keyboardNavRowIndex === $scope.navigationMap[navIndex[$scope.keyboardNavColIndex]].length - 1) {
                        $scope.keyboardNavRowIndex = 0;
                    }
                }
                break;
            case 37:
                $scope.keyboardNavRowIndex = 0;
                // if 1st column => move to Browse button => last column now
                if ($scope.keyboardNavColIndex === 0) {
                    $scope.keyboardNavColIndex = navIndex.length - 1;
                }
                // if not 1st column, decrease the column to the left one
                else {
                    $scope.keyboardNavColIndex--;
                }
                break;
            case 39:
                $scope.keyboardNavRowIndex = 0;
                // if not last column, move to next column
                if ($scope.keyboardNavColIndex + 1 < navIndex.length) {
                    $scope.keyboardNavColIndex++;
                }
                // if last column (i.e. on browse button) => move to 1st column
                else {
                    $scope.keyboardNavColIndex = 0;
                }
                break;
                // shift keydown & keyup events are already being handled in link script.
            case 9:
                //if shift + tab
                if (c.shiftKeyPressed) {
                    if ($scope.keyboardNavRowIndex != 0) {
                        $scope.keyboardNavRowIndex--;
                    }
                    //if it is 0th row
                    else {
                        // and column is also 0th, then move to parent selected navigation menu item
                        if ($scope.keyboardNavColIndex === 0) {
                            if ($scope.selectedMainMenu) {
                                $(".tab-list.selected-item").focus();
                                $scope.$apply(function() {
                                    c.closeTabMenu();
                                });
                            } else {
                                $(".navigation-menu-item.selected-item").focus();
                                $scope.$apply(function() {
                                    c.closeMegaMenu();
                                });
                            }
                            return;
                        } else { //if 0th row but not 0th column, then decrement column & go to its last row
                            $scope.keyboardNavColIndex--;
                            $scope.keyboardNavRowIndex = $scope.navigationMap[navIndex[$scope.keyboardNavColIndex]].length - 1;
                        }
                    }
                }
                // only tab
                else {
                    // if not on the last row of current column, then increment the row
                    if ($scope.navigationMap[navIndex[$scope.keyboardNavColIndex]].length != $scope.keyboardNavRowIndex + 1) {
                        $scope.keyboardNavRowIndex++;
                    }
                    // if on the last row
                    else {
                        // but not the last column, then increment column & go to row 0 of next column.
                        if ($scope.keyboardNavColIndex !== navIndex.length - 1) {
                            $scope.keyboardNavRowIndex = 0;
                            $scope.keyboardNavColIndex++;
                        } //if on last row of last column, then  move to 1st column
                        else if ($scope.keyboardNavColIndex === navIndex.length - 1) {
                            if ($scope.selectedMainMenu) {
                                $('.tab-list.selected-item').focus();
                                c.closeTabMenu();
                            } else {
                                $('div.selected-item').focus();
                                c.closeMegaMenu();
                            }
                            $scope.keyboardNavColIndex = 0;
                        }
                    }
                }
                break;
            default:
                return;
        }
        $scope.navigationMap[navIndex[$scope.keyboardNavColIndex]][$scope.keyboardNavRowIndex].focus();
    };

    /**
     * Helper function for c.initialiseKeyboardNav
     * Searches existing column offsets in range of currentOffset ± DELTA_OFFSET
     * and returns index of the nearest column offset, else -1.
     * @param {Array} columnOffsets - array of left offsets of columns
     * @param {string} currentOffset - current element's left offset
     * @see {@link c.initialiseKeyboardNav}
     */
    var columnSearch = function(columnOffsets, currentOffset) {
        var start = 0,
            end = columnOffsets.length - 1;
        while (start <= end) {
            var mid = Math.floor((start + end) / 2);

            if ((Number(columnOffsets[mid]) - c.DELTA_OFFSET <= currentOffset) && (currentOffset <= Number(columnOffsets[mid]) + c.DELTA_OFFSET))
                return mid;

            else if (Number(columnOffsets[mid]) + c.DELTA_OFFSET < currentOffset)
                start = mid + 1;
            else
                end = mid - 1;
        }
        return -1;
    };

    /**
     * This function identifies columns from the masonry layout and stores in navigationMap object
     */
    c.initialiseKeyboardNav = function() {
        $scope.navigationMap = {};
        var allItems = $('.mega-menu').find('a').not('.browse-button');
        for (var index = 0; index < allItems.length; index++) {
            var element = allItems.get(index);
            if ($scope.navigationMap.hasOwnProperty(element.offsetLeft))
                $scope.navigationMap[element.offsetLeft].push(element);
            else {
                var _navKeys = Object.keys($scope.navigationMap);
                var _currentOffset = element.offsetLeft;
                var _closeColumn = columnSearch(_navKeys, _currentOffset);
                if (_closeColumn !== -1) {
                    $scope.navigationMap[String(_navKeys[_closeColumn])].push(element);
                } else {
                    $scope.navigationMap[_currentOffset] = [element];
                }
            }
        }

        var browseButton = $('.mega-menu').find('.browse-button');
        if (browseButton.length > 0)
            $scope.navigationMap["browse-button"] = [browseButton.get(0)];
    };

    $rootScope.$on(c.SHOW_MOBILE_MEGA_MENU, function(event, showMobileMegaMenu) {
        $scope.showMobileMegaMenu = showMobileMegaMenu;
    });

    // 'ngRepeatFinished' is emitted from onFinishRepeat Angular Provider Directive
    $scope.$on('ngRepeatFinished', function() {
        /* On page load, when sub navbar is populated with taxonomy root topics & portal main menu items this method determines
         whether to use desktop/mobile view for portal navigation by checking if sub navbar contents exceed viewport width. */
        c.evaulateNavigationType();
    });

    $scope.$watch(
        function() {
            return $(".navigation-menu-item-calc").css("line-height");
        },
        function(newVal, oldVal) {
            if (newVal !== oldVal) {
                c.evaulateNavigationType();
                if (!$scope.showMobileMenuOnDesktop && $scope.showMegaMenu) {
                    c.adjustTabPanelHeight(true);
                    c.preMasonryWorkForMegaMenuRefreshWithNewItems();
                    c.initializeMasonry();
                }
            }
        });

    $scope.$watch('showMegaMenu', function(newValue, oldValue) {
        if (!oldValue && newValue) {
            c.initializeMasonry();
        }
    });

    $scope.$watch('selectedMenuItem', function(newSelectedMenuItem, oldSelectedMenuItem) {
        /* When selected main menu item is changed to show mega menu for another root topic,
        execute masonry logic again for refreshing mega menu UI with new menu items */
        if ($scope.showMegaMenu && newSelectedMenuItem && oldSelectedMenuItem) {
            if ((!c.data.activePortalNavRecord && newSelectedMenuItem.sys_id !== oldSelectedMenuItem.sys_id) ||
                (c.data.activePortalNavRecord && newSelectedMenuItem.portal_nav_item !== oldSelectedMenuItem.portal_nav_item)) {
                c.adjustTabPanelHeight(true);
                c.preMasonryWorkForMegaMenuRefreshWithNewItems();
                c.initializeMasonry();
            }
        }
    });

    // Check if mobile view on desktop is needed every 0.25 secs (check link function) browser window is resized.
    $scope.$watch("isWindowResized", function(newValue, oldValue) {
        if (newValue) {
            c.evaulateNavigationType();
            $scope.isWindowResized = false;
            if ($scope.showMegaMenu) {
                c.adjustTabPanelHeight(true);
                c.preMasonryWorkForResponsiveViews();
                c.initializeMasonry();
            }
        }
    });

    // Cleaning up previous grid data for refreshing Mega menu UI when switching from one root topic Mega menu to another root topic Mega menu
    c.preMasonryWorkForMegaMenuRefreshWithNewItems = function() {
        // Resetting Grid variables in controller scope to their initial values.
        c.gridItemWidth = 0;
        c.usedOrphansColumnForGridItemWidth = false;
        c.allGridItemsHaveTwoColumns = false;
        c.allGridItemsHaveSingleColumn = true;

        // Revert the styles applied to grid items for previous selected main menu item
        var gridItems = $(".level-one-item");
        gridItems.each(function(currentIndex, gridItemDOMElement) {
            $(gridItemDOMElement).css({
                "grid-row-end": "auto",
                "grid-column-end": "auto",
                "margin-top": "0px",
                "height": "fit-content"
            });
        });
        $(".quick-links-container").css("min-height", c.isIE ? "0px" : "min-content");
        $(".quick-links-container").css("height", "");
    };

    c.preMasonryWorkForResponsiveViews = function() {
        /* Revert the styles applied to grid items to fill vertical gaps in the previous view.
        We need not revert grid-row-end, grid-column-end values here as actual menu items are not
        changing here like they were changing while switching from one Mega menu view to other. */
        var gridItems = $(".level-one-item");
        gridItems.each(function(currentIndex, gridItemDOMElement) {
            $(gridItemDOMElement).css({
                "margin-top": "0px",
                "height": "fit-content"
            });
        });
        $(".quick-links-container").css("min-height", "min-content");
    };
    $rootScope.$on('isHeaderInMobileView', function($evt, isHeaderInMobileView) {
        //re-evalutate navigation type if header mobile type is changed
        c.evaulateNavigationType();
    });

    // Enables mobile view on desktop if main menu items are overflowing viewport width
    c.evaulateNavigationType = function() {
        var mainMenuDOMElements = $(".main-menu-width-calc");
        // Getting last element if there are multiple as 'ngRepeatFinished' is emitted before rendering last element.
        var mainMenuDOMElement = mainMenuDOMElements[mainMenuDOMElements.length - 1];
        if ($rootScope.isHeaderInMobileView || mainMenuDOMElement && (mainMenuDOMElement.offsetWidth < mainMenuDOMElement.scrollWidth)) {
            $scope.showMobileMenuOnDesktop = !$scope.isMobileView;
            $rootScope.$broadcast(c.SHOW_MOBILE_MENU_ON_DESKTOP, !$scope.isMobileView);
            if ($scope.showMobileMenuOnDesktop) {
                c.closeMegaMenu();
            }
        } else {
            $scope.showMobileMenuOnDesktop = $scope.isMobileView || $rootScope.isHeaderInMobileView;
            $rootScope.$broadcast(c.SHOW_MOBILE_MENU_ON_DESKTOP, $scope.isMobileView || $rootScope.isHeaderInMobileView);
        }
        if ($scope.showMobileMenuOnDesktop) {
            if ($('.toggle-dropdown').get(0)) {
                $('.toggle-dropdown').get(0).tabIndex = -1;
            }
            if ($('.impersonate-and-logout .header-menu-item a').get(1)) {
                $('.impersonate-and-logout .header-menu-item a').get(1).tabIndex = 0;
            }
            if ($('.impersonate-and-logout .header-menu-item a').get(2)) {
                $('.impersonate-and-logout .header-menu-item a').get(2).tabIndex = 0;
            }
        }
    };

    c.initializeMasonry = function() {
        // Do not use grid layout for IE. Using `flex` with display: -ms-flexbox; in CSS
        if (c.isIE) {
            $timeout(function() {
                $('.mega-menu').addClass('ie');
                $('.level-one-item').each(function(index, domElement) {
                    $(domElement).addClass('ie');
                    if (c.getSubTopicGroupCountInGridItem(domElement) === 2) {
                        $(domElement).addClass('ie-two-column');
                    }
                });
                $('.simple-list li').addClass('ie');
                $('.level-one-topic-name').parent().addClass('ie');
                $('.quick-link-title').addClass('ie');
                $('.sub-topics-container').addClass('ie');
                $('.sub-topics-list').addClass('ie');
            }).then(function() {
                c.adjustQuickLinksPanelHeight();
                c.initialiseKeyboardNav();
                topicTooltip();
            });
            return;
        }
        c.textZoomFactor = parseInt($('body').css('font-size')) / c.DEFAULT_FONT_SIZE;

        // Setting scroll position to top before applying masonry logic for proper layout of grid items
        if ($(".mega-menu__items").scrollTop() !== 0) {
            $(".mega-menu__items").scrollTop(0);
        }

        /* Masonry logic is applied in 3 stages.
        1. Allow grid items to span grid rows & columns based on their heights & no.of subtopic groups respectively.
        2. Set mega menu width based on its contents.
        3. Fill any gaps formed in the grid due to the 2-column grid items */
        c.expandMegaMenuToFullWidth().then(function() {
            $timeout(function() {
                c.resizeAllGridItems();
                c.adjustMegaMenuWidth();
                c.fillVerticalGapsInTheGrid().then(function() {
                    c.adjustQuickLinksPanelHeight();
                    c.initialiseKeyboardNav();
                    c.updateMegaMenuPadding();
                    $timeout(function() {
                        c.toggleSubMenuVisibility();
                        c.toggleMegaMenuVisibility();
                        c.adjustTabPanelHeight();
                    });
                });
            });
        });
    };

    c.adjustTabPanelHeight = function(reset) {

        if (reset) {
            $('.employee-center-navigation .tab-container').css('height', 'fit-content');
            return;
        }
        var dropDownHeight = $('.dropdown-container')[0].getBoundingClientRect().height;
        var tabContainer = $('.employee-center-navigation .tab-container');
        if (tabContainer.length > 0 && tabContainer[0].getBoundingClientRect().height < dropDownHeight)
            tabContainer.css('height', dropDownHeight);
    };

    // Returns a Promise ensuring that all grid items are laid out in Mega menu occupying 100% viewport width.
    c.expandMegaMenuToFullWidth = function() {
        return new Promise(function(resolve, reject) {
            // Allow mega menu to consume viewport width for CSS Grid to layout items before applying masonry logic.
            $('.menu-container').addClass('hide-shadow');
            $('.dropdown-container').css('width', '100%');
            $(".mega-menu").css("width", "100%");
            resolve();
        });
    };

    c.updateMegaMenuPadding = function() {
        if (c.data.activePortalNavRecord) {
            var subTopicsElement = c.data.menuItemToChildrenMap[$scope.selectedMenuItem.portal_nav_item];
            var quickLinksElement = c.data.menuItemToQuickLinks[$scope.selectedMenuItem.portal_nav_item];
            var megaMenuElement = $('.mega-menu__items');
            megaMenuElement.removeClass("quick_link_only_menu");
            if (subTopicsElement && subTopicsElement.length) {
                return;
            } else {
                if (quickLinksElement && quickLinksElement.length) {
                    megaMenuElement.addClass("quick_link_only_menu");
                }
            }
        }
        return;
    };
    c.resizeAllGridItems = function() {
        var grid = $(".sub-topics-container").get(0);
        if (grid) {
            var rowHeight = parseInt($window.getComputedStyle(grid).getPropertyValue('grid-auto-rows'));

            var gridItems = $(".level-one-item");
            c.gridItemWidth = c.getGridItemWidth(gridItems);

            gridItems.each(function(currentIndex, gridItemDOMElement) {
                c.resizeGridItem(gridItemDOMElement, rowHeight);
            });
        }
    };

    /* Grid item width is computed based on 3 scenarios.
    1. There is a single column grid item. In this case, we use this grid items width to normalize other items widths.
    2. All grid items have 2 columns. In this case, we take half of the 1st grid item content width and use it to normalize other items widths.
    3. Grid has only 2-column and orphan-list items. In this case, we use the orphan list grid item as base to set other grid items widths. */
    c.getGridItemWidth = function(gridItems) {
        var gridItemCount = gridItems.length;
        for (var index = 0; index < gridItemCount; index++) {
            var gridItemDOMElement = gridItems[index];
            if (c.getSubTopicGroupCountInGridItem(gridItemDOMElement) === 1) {
                return gridItemDOMElement.getBoundingClientRect().width;
            }
            if (index === gridItemCount - 1) {
                var orphanListGridItems = $(gridItemDOMElement).children(".orphan-list");
                if (orphanListGridItems.length) {
                    c.usedOrphansColumnForGridItemWidth = true;
                    return orphanListGridItems[0].getBoundingClientRect().width;
                }
                c.allGridItemsHaveTwoColumns = true;
                return $(gridItemDOMElement).find(".sub-topic-groups")[0].getBoundingClientRect().width / 2;
            }
        }
    };

    // This method sets the rowSpan & columnSpan values for grid item based on its height & no.of subtopic groups under it respectively.
    c.resizeGridItem = function(gridItemDOMElement, rowHeight) {
        var subTopicGroupsDOMElement = $(gridItemDOMElement).children(".sub-topic-groups").get(0);
        var levelTwoItemColumnDOMElements = $(subTopicGroupsDOMElement).children("ul").get();
        if (levelTwoItemColumnDOMElements.length > 1) {
            c.allGridItemsHaveSingleColumn = false;
            gridItemDOMElement.style.gridColumnEnd = "span " + levelTwoItemColumnDOMElements.length;

            $(levelTwoItemColumnDOMElements).each(function(currentIndex, levelTwoItemColumnDOMElement) {
                $(levelTwoItemColumnDOMElement).css("width", c.gridItemWidth - c.GRID_ITEM_PADDING_RIGHT + "px");
                if (currentIndex != levelTwoItemColumnDOMElements.length - 1 || c.allGridItemsHaveTwoColumns) {
                    $(levelTwoItemColumnDOMElement).css({
                        "flex-grow": "1",
                        "padding-right": c.GRID_ITEM_PADDING_RIGHT + "px"
                    });
                }
            });
        }

        var correctedScrollHeight = gridItemDOMElement.scrollHeight / c.textZoomFactor;
        var rowSpan = Math.ceil((correctedScrollHeight + c.GRID_ROW_GAP) / (rowHeight + c.GRID_ROW_GAP));
        gridItemDOMElement.style.gridRowEnd = "span " + rowSpan;
    };

    c.adjustMegaMenuWidth = function() {
        var gridItems = $(".level-one-item");
        var headerWidth = c.getHeaderWidth();
        var browseButton = $('#inner-button');
        var browseButtonWidth = browseButton.length > 0 ? (2 * c.MEGA_MENU_ITEMS_PADDING) + Math.ceil(browseButton.get(0).getBoundingClientRect().width) : 0;
        browseButtonWidth = browseButtonWidth > c.MAX_BUTTON_WIDTH ? c.MAX_BUTTON_WIDTH : browseButtonWidth;
        var tabContainerWidth = $scope.showMenu ? Math.ceil($('.employee-center-navigation .tab-container')[0].getBoundingClientRect().width) : 0;
        if (gridItems.length) {
            $('.sub-topics-container').css('width', '100%');
            var gridElementTopValue = gridItems[0].getBoundingClientRect().top;
            var quickLinkWidth = $(".quick-links-container").innerWidth();

            // Computing no.of columns based on initial grid items layout.
            var gridColumnCount = c.getGridColumnCount(gridItems, gridElementTopValue);

            // Get computed grid (sub-topics-container) width.
            var subTopicsContainerWidth = c.getGridContainerWidth(gridItems, gridColumnCount);
            $('.sub-topics-container').css('width', c.MEGA_MENU_ITEMS_PADDING + subTopicsContainerWidth);
            subTopicContainerWidth = c.MEGA_MENU_ITEMS_PADDING + subTopicsContainerWidth + quickLinkWidth;
            var megaMenuWidth = browseButtonWidth > subTopicContainerWidth ? browseButtonWidth : subTopicContainerWidth;
            if (c.data.activePortalNavRecord && $scope.selectedMainMenu)
                megaMenuWidth += tabContainerWidth;
            //if it is expanded menu type
            if (c.data.activePortalNavRecord && $scope.selectedMainMenu && !$scope.showMenuOnLeft) {
                var leftOffset = $('.employee-center-navigation .tab-container')[0].getBoundingClientRect().left;
                if (leftOffset + megaMenuWidth > headerWidth)
                    $('.dropdown-container').css('width', headerWidth - leftOffset);
                else
                    $('.dropdown-container').css('width', megaMenuWidth);
            } else {

                // Checking if there is room for fitting another topic on the right side and adjusting width of mega menu.
                var canFitAnotherTopicOnTheRight = c.canFitAnotherTopicOnTheRight(megaMenuWidth, gridItems, gridColumnCount);
                megaMenuWidth = megaMenuWidth > c.MEGA_MENU_MAX_WIDTH ? c.MEGA_MENU_MAX_WIDTH : megaMenuWidth;
                megaMenuWidth = canFitAnotherTopicOnTheRight && (headerWidth < c.MEGA_MENU_MAX_WIDTH) ? headerWidth : megaMenuWidth;

                // If mega menu doesnt fit on the right side, fix the right coordinate and expand toward left
                if (!$scope.selectedMainMenu) {
                    if ($scope.megaMenuLeftOffset + megaMenuWidth > headerWidth) {
                        $('.dropdown-container').css({
                            'right': 0,
                            'left': ''
                        });
                    } else {
                        $('.dropdown-container').css({
                            'right': '',
                            'left': $scope.megaMenuLeftOffset
                        });
                    }
                }

                $('.dropdown-container').css('width', megaMenuWidth == headerWidth ? '100%' : megaMenuWidth);
                if (!canFitAnotherTopicOnTheRight && c.hasSecondRowStarted(gridItems, gridElementTopValue)) {
                    $(".dropdown-container").css("width", megaMenuWidth + c.MEGA_MENU_ITEMS_PADDING * c.textZoomFactor > c.MEGA_MENU_MAX_WIDTH ? c.MEGA_MENU_MAX_WIDTH : megaMenuWidth + c.MEGA_MENU_ITEMS_PADDING * c.textZoomFactor);
                }
            }
        } else if ($scope.getQuickLinksForMenuItem($scope.selectedMenuItem)) {
            var quickLinkContainerWidth = $('.quick-links-container').outerWidth() + parseFloat($('.mega-menu__items').css('padding-left')) + parseFloat($('.mega-menu__items').css('padding-right'));
            $('.dropdown-container').css('width', tabContainerWidth + (quickLinkContainerWidth > browseButtonWidth ? quickLinkContainerWidth : browseButtonWidth));
        } else if ($scope.getBrowseButtontext($scope.selectedMenuItem)) {
            $('.dropdown-container').css('width', $('#inner-button').outerWidth(true) + tabContainerWidth);
        }
        $('.menu-container').removeClass('hide-shadow');
    };

    c.adjustQuickLinksPanelHeight = function() {
        var quicklinksContainer = $(".quick-links-container");
        if (quicklinksContainer.length) {
            var containerBottom = quicklinksContainer[0].getBoundingClientRect().bottom;
            var quickLinksLastBottom = $(".quick-links-container > .simple-list > li:last-child")[0].getBoundingClientRect().bottom;
            if (containerBottom <= quickLinksLastBottom) {
                quicklinksContainer.css("height", "min-content");
            }
            var gridElements = $('.sub-topics-container');
            if (gridElements.length) {
                var gridDOMElement = gridElements.get(0);
                var quickLinksPanelHeight = parseInt(gridDOMElement.offsetHeight);
                var usedGridScrollHeight = false;
                if (gridDOMElement.offsetHeight < gridDOMElement.scrollHeight) {
                    usedGridScrollHeight = true;
                    quickLinksPanelHeight = parseInt(gridDOMElement.scrollHeight);
                }
                $(".quick-links-container").css("min-height", quickLinksPanelHeight + (usedGridScrollHeight ? c.MEGA_MENU_ITEMS_PADDING : 0) + "px");
            }
        }
    };

    // Returns no.of columns based on initial (not final) grid items layout. Final column count may change after filling vertical gaps.
    c.getGridColumnCount = function(gridItems, gridElementTopValue) {
        var gridColumnCount = 0;
        for (var index = 0; index < gridItems.length; index++) {
            var gridItemDOMElement = gridItems[index];
            if (gridItemDOMElement.getBoundingClientRect().top !== gridElementTopValue) {
                break;
            }
            gridColumnCount += (c.getSubTopicGroupCountInGridItem(gridItemDOMElement) + $(gridItemDOMElement).children(".orphan-list").length);
        }
        return gridColumnCount;
    };

    // Grid (sub-topics-container) width is computed based on how c.gridItemWidth value is computed (Check c.getGridItemWidth method documentation).
    c.getGridContainerWidth = function(gridItems, gridColumnCount) {
        var subTopicsContainerWidth = c.allGridItemsHaveTwoColumns ? (gridItems[0].getBoundingClientRect().width * gridColumnCount / 2) : (gridColumnCount * c.gridItemWidth);
        if (c.usedOrphansColumnForGridItemWidth) {
            /* Orphan links column is used for computing grid item width only when all the grid items have 2-columns (i. e. level-2 sub topic count in each grid item > 10).
             So we are halving the grid item width. But in case of 1-level hierarchy also mega menu is displayed and orphan links column is used for grid item width computation, so we need not half grid item width. */
            subTopicsContainerWidth = Math.ceil(gridItems[0].getBoundingClientRect().width * gridColumnCount / (c.allGridItemsHaveTwoColumns ? 2 : 1));
        }
        return subTopicsContainerWidth;
    };

    // Checks if there is room for fitting another topic on the right side.
    c.canFitAnotherTopicOnTheRight = function(megaMenuWidth, gridItems, gridColumnCount) {
        var canFitAnotherTopicOnRight = (megaMenuWidth + c.gridItemWidth > $('.sp-page-root').width()) ||
            (megaMenuWidth + 2 * c.gridItemWidth > $('.sp-page-root').width() && gridColumnCount < gridItems.length && c.getSubTopicGroupCountInGridItem(gridItems[gridColumnCount]) === 1);
        if (c.allGridItemsHaveTwoColumns) {
            canFitAnotherTopicOnRight = (megaMenuWidth + gridItems[0].getBoundingClientRect().width > $('.sp-page-root').width());
        }
        return canFitAnotherTopicOnRight;
    };

    c.hasSecondRowStarted = function(gridItems, gridElementTopValue) {
        for (var index = 0; index < gridItems.length; index++) {
            var gridItemDOMElement = gridItems[index];
            if (gridItemDOMElement.getBoundingClientRect().top !== gridElementTopValue) {
                return true;
            }
        }
        return false;
    };

    c.fillVerticalGapsInTheGrid = function() {
        return new Promise(function(resolve, reject) {
            // Vertical gaps show up due to presence of 2-column grid item in rows other than 1st row.
            if (c.allGridItemsHaveSingleColumn) {
                resolve();
            }
            var gridTop = $(".sub-topics-container").get(0).getBoundingClientRect().top;
            var gridItems = $(".level-one-item");
            for (var currentIndex = 0; currentIndex < gridItems.length; currentIndex++) {
                var currentGridItemDOMElement = gridItems[currentIndex];

                var currentGridItemTop = currentGridItemDOMElement.getBoundingClientRect().top,
                    currentGridItemRight = currentGridItemDOMElement.getBoundingClientRect().right,
                    currentGridItemLeft = currentGridItemDOMElement.getBoundingClientRect().left;

                // Gaps show up only for items not in 1st row & are single-column items
                if (currentGridItemTop !== gridTop && (c.getSubTopicGroupCountInGridItem(currentGridItemDOMElement) === 1 || $(currentGridItemDOMElement).children(".orphan-list").length)) {
                    var maxBottomValue = -1;
                    var currentItemLiesInTwoColumnItemRow = false,
                        currentItemRowSpanValue;

                    for (var index = 0; index < gridItems.length; index++) {
                        var gridItemElement = gridItems[index];
                        var subTopicGroupCountInGridItem = c.getSubTopicGroupCountInGridItem(gridItemElement);

                        // Need not continue if we reached current item while filling gaps, continue to next grid item (outer loop).
                        if (c.areSameGridItems(currentGridItemDOMElement, gridItemElement)) {
                            break;
                        }
                        // Checking if current item is lying in same row as a 2-column item. We will use this later below to adjust current items height.
                        if (subTopicGroupCountInGridItem === 2 && gridItemElement.getBoundingClientRect().top === currentGridItemTop) {
                            currentItemLiesInTwoColumnItemRow = true;
                            currentItemRowSpanValue = parseInt(currentGridItemDOMElement.style.gridRowEnd.substr(5));
                        }
                        // Collecting the grid item that sits right above current item to adjust the vertical gap formed between them.
                        if (gridItemElement.getBoundingClientRect().left === currentGridItemLeft ||
                            (gridItemElement.getBoundingClientRect().right === currentGridItemRight && subTopicGroupCountInGridItem === 2) ||
                            (gridItemElement.getBoundingClientRect().left < currentGridItemLeft && gridItemElement.getBoundingClientRect().right > currentGridItemLeft)) {
                            maxBottomValue = Math.max(maxBottomValue, gridItemElement.getBoundingClientRect().bottom);
                        }
                    }

                    /* If there is no item above current item (maxBottomValue = -1), it means it should sit in the 1st row. And if there is a maxBottomValue,
                    and the gap between the maxBottomValueGridItem & current item > grid row gap (20px), then add margin top to current element to fill this gap. */
                    if (maxBottomValue === -1 || (currentGridItemTop - maxBottomValue > c.GRID_ROW_GAP))
                        c.fillVerticalGapForCurrentGridItem(gridItems, currentIndex, maxBottomValue, currentItemLiesInTwoColumnItemRow, currentItemRowSpanValue);
                }
            }
            resolve();
        });
    };

    c.areSameGridItems = function(gridItem1, gridItem2) {
        var gridItemTop = gridItem2.getBoundingClientRect().top;
        var gridItemRight = gridItem2.getBoundingClientRect().right;
        var gridItemBottom = gridItem2.getBoundingClientRect().bottom;
        var gridItemLeft = gridItem2.getBoundingClientRect().left;

        return gridItem1.getBoundingClientRect().top === gridItemTop &&
            gridItem1.getBoundingClientRect().right === gridItemRight &&
            gridItem1.getBoundingClientRect().bottom === gridItemBottom &&
            gridItem1.getBoundingClientRect().left === gridItemLeft;
    };

    c.fillVerticalGapForCurrentGridItem = function(gridItems, currentIndex, maxBottomValue, currentItemLiesInTwoColumnItemRow, currentItemRowSpanValue) {
        var gridTop = $(".sub-topics-container").get(0).getBoundingClientRect().top;
        var currentGridItemDOMElement = gridItems[currentIndex];
        var currentGridItemTop = currentGridItemDOMElement.getBoundingClientRect().top;

        var marginTop = (maxBottomValue === -1) ? (currentGridItemTop - gridTop) : (currentGridItemTop - maxBottomValue - c.GRID_ROW_GAP);
        $(currentGridItemDOMElement).css({
            "margin-top": -1 * marginTop + "px"
        });
        /* If current item is lying in same row as a 2-column item, we need to adjust its height
           to prevent it from occupying extra space below after applying margin-top on it. */
        if (currentItemLiesInTwoColumnItemRow || currentIndex === gridItems.length - 1) {
            var rowSpanValue = (currentItemRowSpanValue - marginTop / c.GRID_ROW_GAP);
            currentGridItemDOMElement.style.gridRowEnd = "span " + (rowSpanValue > 0 ? rowSpanValue : 1);
            if (rowSpanValue < 0) {
                $(currentGridItemDOMElement).css({
                    "height": "fit-content"
                });
            }
        }
    };

    $scope.handleMobileMainMenuItemClick = function(menuItem) {

        if (menuItem.render_as == 'modal_window' && menuItem.widget) {
            spModal.open({
                title: menuItem.name ? menuItem.name : menuItem.label,
                size: 'lg',
                widget: menuItem.widget,
                widgetInput: menuItem.widget_parameters,
                buttons: [{
                    label: '${Close}',
                    primary: true
                }]
            });
            return;
        }

        if (c.doesMenuItemHaveChildren(menuItem)) {
            if (!$scope.showMobileMegaMenu)
                $scope.showMobileMegaMenu = true;

            $scope.selectedMobileMenuItem = menuItem;
            c.isTabbedMobileMenu = (c.data.activePortalNavRecord && menuItem.submenu_type == 'expanded');
            $scope.isLevelOneMobileMegaMenu = !c.isTabbedMobileMenu;
            c.levelDrilled = 1;
            $scope.isLevelOneMobileMegaMenu = true;
            $scope.getLevelOneMenuItems(menuItem);
            $scope.getBrowseButtontext(menuItem);
            $rootScope.$broadcast(c.SHOW_MOBILE_MEGA_MENU, true);
            $anchorScroll('ec-header-container');
            return;
        }
        c.redirectToMenuItemPage(menuItem);
        $anchorScroll('ec-header-container');
        $rootScope.$broadcast(c.TOGGLE_MOBILE_MENU_VISIBILITY);
    };

    // 2 cases here, user either clicks level-one item or level-two item
    $scope.handleMobileMegaMenuItemClick = function(menuItem) {
        /* Case-1: If level-one item has children, we are showing level-two children under it.
         Otheriwse simply redirect user to level-one topic page. */
        if (c.doesMenuItemHaveChildren(menuItem)) {
            ++c.levelDrilled;
            if (c.levelDrilled == 2)
                $scope.levelOneSelectedMobileMenuItem = $scope.selectedMobileMenuItem;
            if (c.levelDrilled == 3)
                $scope.levelTwoSelectedMobileMenuItem = $scope.selectedMobileMenuItem;
            $scope.selectedMobileMenuItem = menuItem;

            /*if it is tabbed view, quick links should be activated only on 1st level*/
            $scope.isLevelOneMobileMegaMenu = (c.isTabbedMobileMenu && c.levelDrilled == 2);
            $scope.getLevelOneMenuItems(menuItem);
            $scope.getBrowseButtontext(menuItem);
            // Scroll to top of the page
            $anchorScroll('ec-header-container');
            return;
        }
        // Case-2: level-two topics have no children in mega menu. So simply redirect user to clicked topic page.
        c.redirectToMenuItemPage(menuItem);
        $anchorScroll('ec-header-container');
        $rootScope.$broadcast(c.TOGGLE_MOBILE_MENU_VISIBILITY);
    };

    /* If back button is clicked on level-1 of mega menu, go back to main menu.
    Otherwise, change selected topic to parent of level-2 topics to refresh the view */
    $scope.goBackOnMobileView = function() {
        if (c.levelDrilled == 1) {
            $scope.lastSelectedElementId = $scope.selectedMobileMenuItem.sys_id;
            $scope.showMobileMegaMenu = false;
            $anchorScroll('ec-header-container');
            $rootScope.$broadcast(c.SHOW_MOBILE_MEGA_MENU, false);
            return;
        }
        --c.levelDrilled;
        $(".back-container").blur();
        if (c.levelDrilled == 2) {
            $scope.selectedMobileMenuItem = $scope.levelTwoSelectedMobileMenuItem;
            $scope.levelTwoSelectedMobileMenuItem = undefined;
        } else if (c.levelDrilled == 1) {
            $scope.selectedMobileMenuItem = $scope.levelOneSelectedMobileMenuItem;
            $scope.levelOneSelectedMobileMenuItem = undefined;
        }
        $scope.isLevelOneMobileMegaMenu = (!c.isTabbedMobileMenu || c.levelDrilled == 2);
        $scope.getLevelOneMenuItems($scope.selectedMobileMenuItem);
        $anchorScroll('ec-header-container');
    };

    // Handle click on Main menu anywhere other than a navigation menu item.
    $scope.handleClickOnMainMenu = function($event) {
        var target = $event.target;
        if (target.className && target.className.indexOf("navigation-menu-item") >= 0) {
            return;
        }

        var parent = target.parentElement;
        if (parent && parent.className && parent.className.indexOf("navigation-menu-item") >= 0) {
            return;
        }

        c.closeMegaMenu();
};

    /* There are 4 cases to handle when a main menu navigation item is clicked
       1. If simple/mega menu is already open, then close it.
       2. If there is no menu attached to this menu item, then redirect user to corresponding portal page.
       3. Whether to show simple/mega menu based on hierarchy level of root topic i.e  If there is only 1 level, show simple menu. otherwise show mega menu.
       4. Show mega menu when there are 2 levels of topic hierarchy.
    */
    $scope.handleMainMenuItemClick = function(menuItem, $event, isTab) {
        var isRedirection = ((!isTab && !c.doesMenuItemHaveChildren(menuItem)) || (isTab && !c.hasSubMenuData(menuItem)));
        var appseeData = {
          url : isRedirection ? getURL(menuItem) : '',
          link_type : isRedirection && menuItem.url_target && menuItem.url_target == '_blank' ? 'External' : 'Internal',
          label: menuItem.name ? menuItem.name : menuItem.label
        };
        raiseAppseeEvent(appseeData);
        var headerWidth = c.getHeaderWidth();
        $scope.keyboardNavRowIndex = 0;
        $scope.keyboardNavColIndex = 0;
        // Case 1
        if ((!c.data.activePortalNavRecord && $scope.selectedMenuItem && $scope.selectedMenuItem.sys_id === menuItem.sys_id) ||
            (c.data.activePortalNavRecord && $scope.selectedMenuItem && $scope.selectedMenuItem.portal_nav_item === menuItem.portal_nav_item)) {
            if (isTab)
                c.closeTabMenu();
            else
                c.closeMegaMenu();
            return;
        }

        if ($scope.selectedMainMenu && $scope.selectedMainMenu.portal_nav_item === menuItem.portal_nav_item) {
            c.closeMegaMenu();
            return;
        }

        // Case 2
        if (menuItem.render_as == 'modal_window' && menuItem.widget) {
            c.closeMegaMenu();
            $scope.showMegaMenu = false;
            spModal.open({
                title: menuItem.name ? menuItem.name : menuItem.label,
                size: 'lg',
                widget: menuItem.widget,
                widgetInput: menuItem.widget_parameters,
                buttons: [{
                    label: '${Close}',
                    primary: true
                }]
            });
            return;
        }

        // Case 3
        if ((!isTab && !c.doesMenuItemHaveChildren(menuItem)) || (isTab && !c.hasSubMenuData(menuItem))) {
            c.closeMegaMenu();
            c.redirectToMenuItemPage(menuItem);
            return;
        }

        if (menuItem.submenu_type == 'expanded') {
            if ($scope.selectedMenuItem || $scope.selectedMainMenu)
                c.closeMegaMenu();
            $timeout(function() {
                $scope.selectedMainMenu = menuItem;
                $scope.showMenu = true;
                $timeout(function() {
                    var tabContainerEle = $('.employee-center-navigation .tab-container')[0];
                    var tabWidth = tabContainerEle ? tabContainerEle.getBoundingClientRect().width : 0;
                    var leftOffset = $event.currentTarget.offsetLeft;
                    if (leftOffset + c.minMegaMenuWidth + tabWidth > headerWidth)
                        $scope.showMenuOnLeft = true;
                    if (!$scope.showMenuOnLeft)
                        $scope.megaMenuPosition = {
                            'left': leftOffset
                        };
                    else {
                        if (leftOffset + tabWidth > headerWidth)
                            $scope.megaMenuPosition = {
                                'right': headerWidth - leftOffset - $event.currentTarget.offsetWidth
                            };
                        else
                            $scope.megaMenuPosition = {
                                'right': headerWidth - leftOffset - tabWidth
                            };
                    }
                    c.resizeDropDownContainer();
                    c.toggleMegaMenuVisibility();
                });
            });
            return;
        }

        if (!isTab)
            c.closeMegaMenu();
        else {
            c.adjustTabPanelHeight(true);
            c.toggleSubMenuVisibility(true);
        }

        $timeout(function() {
          $scope.selectedMenuItem = menuItem;

          // Case 4
          if (!isTab && c.isSingleLevelTopicHierarchy(menuItem)) {
              var computedLeftCoordinate = $event.currentTarget.offsetLeft;
              computedLeftCoordinate = (computedLeftCoordinate + c.SIMPLE_MENU_WIDTH <= headerWidth) ? computedLeftCoordinate : (headerWidth - c.SIMPLE_MENU_WIDTH);
              $scope.megaMenuLeftOffset = computedLeftCoordinate;
              $scope.megaMenuPosition = {
                  'left': computedLeftCoordinate > 0 ? computedLeftCoordinate : 0 + 'px'
              };

              var quickLinks = c.data.activePortalNavRecord ? c.data.menuItemToQuickLinks[menuItem.portal_nav_item] : c.data.menuItemToQuickLinks[menuItem.sys_id];
              $scope.showMegaMenu = (quickLinks && quickLinks.length > 0) || menuItem.browse_button == 'true';
              if (!$scope.showMegaMenu) {
                  $timeout(function() {
                      c.toggleMegaMenuVisibility();
                  });
              }
              return;
          }
          // Case 5
          $scope.showMegaMenu = true;
          if (!isTab) {
              var computedLeftCoordinate = $event.currentTarget.offsetLeft;
              computedLeftCoordinate = (computedLeftCoordinate + c.SIMPLE_MENU_WIDTH <= headerWidth) ? computedLeftCoordinate : (headerWidth - c.SIMPLE_MENU_WIDTH);
              $scope.megaMenuLeftOffset = computedLeftCoordinate;
              $scope.megaMenuPosition = {
                  'left': computedLeftCoordinate > 0 ? computedLeftCoordinate : 0 + 'px'
              };
              $scope.selectedMenuItemRightCoordinate = $event.currentTarget.getBoundingClientRect().right;
          }
      });
    };

    $scope.handleMegaMenuItemClick = function($event, megaMenuItem) {
        $event.preventDefault();
        $($event.target).parent().tooltip('hide');
        $timeout(function() {
            c.closeMegaMenu();
        });

        var appseeData = {
          link_type : megaMenuItem.url_target && megaMenuItem.url_target == '_blank' ? 'External' : 'Internal',
          url : getURL(megaMenuItem),
          label: megaMenuItem.name ? megaMenuItem.name : megaMenuItem.label
        };
        raiseAppseeEvent(appseeData);

        if ($event.ctrlKey || $event.metaKey)
            return;
        c.redirectToMenuItemPage(megaMenuItem);
    };

    $scope.handleQuickLinkClick = function($event, quickLink) {
        var appseeData = {
          link_type : quickLink.target ? 'External' : 'Internal',
          url : quickLink.url,
          label: quickLink.title
        };

        if (quickLink.type == 'guided_help') {
            c.server.get({
                "action": "openGuidedhelp",
                "guidedHelpId": quickLink.guided_help
            }).then(function(resp) {
                $timeout(function() {
                    $window.open(resp.data.guidedHelpResponse.url, '_self');
                }, raiseAppseeEvent(appseeData, resp.data.guidedHelpResponse, true));
            });
        } else
          raiseAppseeEvent(appseeData);
        $timeout(function() {
            c.closeMegaMenu();
        });
    };

    $scope.browseAll = function(selectedTopic) {
        $timeout(function() {
            c.closeMegaMenu();
        });
        c.redirectToMenuItemPage(selectedTopic);

        var appseeData = {
          link_type : selectedTopic.url_target && selectedTopic.url_target == '_blank' ? 'External' : 'Internal',
          url : getURL(selectedTopic),
          label: selectedTopic.name ? selectedTopic.name : selectedTopic.label
        };
        raiseAppseeEvent(appseeData);

        if ($scope.showMobileMenuOnDesktop) {
            $rootScope.$broadcast(c.TOGGLE_MOBILE_MENU_VISIBILITY);
        }
    };

    // Returns all sub topics (under selected root topic)
    $scope.getLevelOneMenuItems = function(selectedMenuItem) {
        $scope.levelOneMenuItems = c.data.activePortalNavRecord ? c.data.menuItemToChildrenMap[selectedMenuItem.portal_nav_item] : c.data.menuItemToChildrenMap[selectedMenuItem.sys_id];
        return $scope.levelOneMenuItems;
    };

    $scope.getLevelTwoMenuItems = function(selectedMenuItem) {
        $scope.levelTwoMenuItems = c.data.activePortalNavRecord ? c.data.menuItemToChildrenMap[selectedMenuItem.portal_nav_item] : c.data.menuItemToChildrenMap[selectedMenuItem.sys_id];
        return $scope.levelTwoMenuItems;
    };

    $scope.getQuickLinksForMenuItem = function(selectedMenuItem) {
        $scope.QuickLinksForMenuItem = c.data.activePortalNavRecord ? c.data.menuItemToQuickLinks[selectedMenuItem.portal_nav_item] : c.data.menuItemToQuickLinks[selectedMenuItem.sys_id];
        return $scope.QuickLinksForMenuItem;
    };

    // Returns all child navigation items for selectedMenuItem
    $scope.getChildNavItems = function(selectedMenuItem) {
        var childNavItems = c.data.activePortalNavRecord ? c.data.menuItemToChildrenMap[selectedMenuItem.portal_nav_item] : c.data.menuItemToChildrenMap[selectedMenuItem.sys_id];
        return childNavItems;
    };

    // Returns all child items (quick links & browse button also) for selectedMenuItem
    $scope.hasChildItems = function(selectedMenuItem) {
        if (selectedMenuItem.render_as == 'modal_window') {
            return false;
        }
        var childNavItems = c.data.activePortalNavRecord ? c.data.menuItemToChildrenMap[selectedMenuItem.portal_nav_item] : c.data.menuItemToChildrenMap[selectedMenuItem.sys_id];
        var quickLinks = c.data.activePortalNavRecord ? c.data.menuItemToQuickLinks[selectedMenuItem.portal_nav_item] : c.data.menuItemToQuickLinks[selectedMenuItem.sys_id];
        return (childNavItems && childNavItems.length > 0) || (quickLinks && quickLinks.length > 0);
    };

    $scope.getBrowseButtontext = function(selectedMenuItem, tabMenu) {
        if (!selectedMenuItem || (selectedMenuItem && selectedMenuItem.browse_button !== 'true')) {
            return false;
        } else {
            var buttonText = selectedMenuItem.browse_button_text == '' ? '${Browse all}' : selectedMenuItem.browse_button_text;
            if (tabMenu) {
                $scope.tabbedBrowseButtontext = buttonText;
                return true;
            }
            $scope.browseButtontext = buttonText;
            return true;
        }
    };

    // Returns all sub topics (under selected root topic) with no children
    $scope.getLevelOneTopicsWithNoChildren = function(selectedRootMenuItem) {

        var levelOneSubTopics = c.data.activePortalNavRecord ? c.data.menuItemToChildrenMap[selectedRootMenuItem.portal_nav_item] : c.data.menuItemToChildrenMap[selectedRootMenuItem.sys_id];

        $scope.levelOneTopicsWithNoChildren = levelOneSubTopics.filter(function(levelOneSubTopic) {
            return !c.doesMenuItemHaveChildren(levelOneSubTopic);
        });
        return $scope.levelOneTopicsWithNoChildren;
    };

    $scope.getLevelTwoTopicsAsGroupsOfTen = function(levelTwoSubTopics) {
        var COLUMN_SPLIT_BREAKPOINT_TOPIC_COUNT = 10,
            MAX_TOPIC_COUNT_UNDER_SUBTOPIC_GROUP = 20;
        var groupsOfLevelTwoTopics = [],
            subTopics = angular.copy(levelTwoSubTopics);
        subTopics = subTopics.splice(0, MAX_TOPIC_COUNT_UNDER_SUBTOPIC_GROUP);

        if (subTopics.length <= COLUMN_SPLIT_BREAKPOINT_TOPIC_COUNT) {
            while (subTopics.length) {
                groupsOfLevelTwoTopics.push(subTopics.splice(0, COLUMN_SPLIT_BREAKPOINT_TOPIC_COUNT));
            }
        } else {
            var columnCount = Math.ceil(subTopics.length / COLUMN_SPLIT_BREAKPOINT_TOPIC_COUNT);
            var topicCountPerColumn = Math.ceil(subTopics.length / columnCount);
            var lastColumnTopicCount = subTopics.length % topicCountPerColumn;
            if (lastColumnTopicCount !== 0) {
                while (topicCountPerColumn + lastColumnTopicCount <= COLUMN_SPLIT_BREAKPOINT_TOPIC_COUNT) {
                    topicCountPerColumn++;
                    lastColumnTopicCount = subTopics.length % topicCountPerColumn;
                }
            }
            while (subTopics.length) {
                groupsOfLevelTwoTopics.push(subTopics.splice(0, topicCountPerColumn));
            }
        }
        return groupsOfLevelTwoTopics;
    };

    c.isSingleLevelTopicHierarchy = function(rootTopic) {
        var parentNavItemId = c.data.activePortalNavRecord ? rootTopic.portal_nav_item : rootTopic.sys_id;
        if (!c.data.menuItemToChildrenMap[parentNavItemId])
            return false;

        return c.data.menuItemToChildrenMap[parentNavItemId].every(function(subTopic) {
            return !c.doesMenuItemHaveChildren(subTopic);
        });
    };

    c.doesMenuItemHaveChildren = function(menuItem) {
        return (c.data.activePortalNavRecord ? $scope.hasChildItems(menuItem) : (menuItem.sys_id in c.data.menuItemToChildrenMap));
    };

    c.getSubTopicGroupCountInGridItem = function(gridItemDOMElement) {
        return $(gridItemDOMElement).find(".sub-topic-groups > .simple-list").length;
    };

    /* Whenever we are not showing mega menu, make sure to clear selectedMenuItem as well.
    Otherwise, simple dropdown will appear even when there are more than 1 level of sub topics. */
    c.closeMegaMenu = function() {
        c.toggleSubMenuVisibility(true);
        c.toggleMegaMenuVisibility(true);
        $scope.showMenu = false;
        $scope.showMegaMenu = false;
        $scope.selectedMenuItem = undefined;
        $scope.selectedMainMenu = undefined;
        $scope.showMenuOnLeft = false;
        $scope.megaMenuPosition = undefined;
        $timeout(function() {
            c.resizeDropDownContainer();
        });
    };

    c.toggleMegaMenuVisibility = function(hide) {
        var dropDownEle = $('.dropdown-container');
        return hide ? dropDownEle.addClass('visibility') : dropDownEle.removeClass('visibility');
    }

    c.toggleSubMenuVisibility = function(hide) {
        var subMenuEle = $('.mega-menu');
        return hide ? subMenuEle.addClass('visibility') : subMenuEle.removeClass('visibility');
    }

    c.closeTabMenu = function() {
        c.toggleSubMenuVisibility(true);
        c.adjustTabPanelHeight(true);
        $scope.showMegaMenu = false;
        $scope.selectedMenuItem = undefined;
        $timeout(function() {
            c.resizeDropDownContainer();
        });
    };

    c.getHeaderWidth = function() {
        return $('.employee-center-navigation')[0].getBoundingClientRect().width;
    };

    c.hasSubMenuData = function(item) {
        if (c.doesMenuItemHaveChildren(item) || $scope.getQuickLinksForMenuItem(item))
            return true;
        return false;
    };

    c.resizeDropDownContainer = function() {
        var megaMenuEle = $('.mega-menu')[0];
        var tabContainerEle = $('.employee-center-navigation .tab-container')[0];
        if (tabContainerEle && megaMenuEle && $('.mega-menu').hasClass('visibility')) {
            megaMenuEle = null;
        }
        $('.dropdown-container').css('width', (megaMenuEle ? megaMenuEle.getBoundingClientRect().width : null) + (tabContainerEle ? tabContainerEle.getBoundingClientRect().width : null));
        $('.menu-container').removeClass('hide-shadow');
    };


    c.redirectToMenuItemPage = function(menuItem) {
        var searchString = c.getRedirectSearchParams(menuItem);
        if (menuItem.type === "url") {
            var url_target = menuItem.url_target || "_self";
            if (menuItem.href == '') {
                spUtil.addErrorMessage('${There is no destination set for this menu item}');
            } else {
                if (menuItem.href[0] === "#") {
                    var currentUrl = $location.url();
                    var newUrl = (currentUrl.indexOf('#') === -1) ? currentUrl : currentUrl.split('#')[0];
                    $location.url(newUrl + menuItem.href);
                    return;
                }
                $window.open(menuItem.href, url_target);
            }
        } else {
            var currentHash = $location.hash();
            if (currentHash) {
                $location.hash('');
            }
            $location.path('/' + c.data.portalSuffix).search(searchString);
        }
    };

    $scope.returnRedirectionPath = function(menuItem) {
        var searchString = c.getRedirectSearchParams(menuItem);
        var path = '/' + c.data.portalSuffix + '?' + searchString;
        return path;
    }

    $scope.redirectToBrowseAll = function(menuItem) {
        var href = $scope.returnRedirectionPath(menuItem);
        $window.open(href, "_self");
    }

    c.getRedirectSearchParams = function(menuItem) {
        // Checking if menu item belongs to a taxonomy. If so, then redirect to topic page else, redirect to href.
        var pageToRedirect = menuItem.template && menuItem.template.length > 0 ? menuItem.template : 'emp_taxonomy_topic';
        var searchString = menuItem.taxonomy ? "id=" + pageToRedirect + "&topic_id=" + menuItem.sys_id : menuItem.href.substring(1);

        return searchString;
    };

    $scope.getMegaMenuItemHref = function(menuItem) {
        var searchString = c.getRedirectSearchParams(menuItem);
        if (menuItem.type === "url") {
            return menuItem.href;
        } else {
            return '/' + c.data.portalSuffix + '?' + searchString;
        }
    };

    function raiseAppseeEvent(clickData, data, isGuided) {
      var appseePayload = {};
      appseePayload.name = "Top Navigation Analytics";
      appseePayload.data = {};
      appseePayload.data["User Id"] = c.data.userID;
      appseePayload.data["User name"] = c.data.userName;
      appseePayload.data["Item clicked"] = clickData.label;
      appseePayload.data["Link type"] = clickData.link_type;
      appseePayload.data["URL"] = clickData.url;
      appseePayload.data["Session"] = c.data.sessionID;
      appseePayload.data["Device"] = c.data.isMobile ? 'Mobile' : 'Desktop';
      snAnalytics.addEvent(appseePayload);

      if(isGuided && data.isNew) {
        var payload = {};
        payload.name = "Guided Self-service Started";
        payload.data = {};
        payload.data["Guided Self-service"] = data.processName;
        payload.data["User Id"] = data.userId;
        payload.data["Source"] = data.source;
        snAnalytics.addEvent(payload);
      }
    }

    /**
     * Checking ellipsis
     */
    function checkEllipsis(topic) {
        return topic.scrollWidth > $(topic).parent().width();
    }

    function getURL(menu) {
        var url = c.getRedirectSearchParams(menu);
        if(menu.type == 'url') {
            if (menu.href[0] === "#") {
                var currentUrl = $location.url();
                var newUrl = (currentUrl.indexOf('#') === -1) ? currentUrl : currentUrl.split('#')[0];
                url = newUrl + menu.href;
            } else
                url = menu.href;
        }
        return url;
    }

    /**
     * Applying tooltip to ellipsis elements
     */
    function topicTooltip() {
        var topics = $([
            '.simple-list .dropdown-menu-item span:not(.icon)',
            '.mega-menu-item span:not(.icon)',
            '.browse-button span',
            '.quick-link-title',
            '.mobile-mega-menu__quick-link a',
            '.quick-links-container a',
            '.level-one-topic-name span:not(.icon)',
            '.level-two-topic-name span:not(.icon)',
            '.tab-list'
        ].join());
        topics.each(function(_index, topic) {
            if (checkEllipsis(topic)) {
                $(topic).tooltip('enable');
            }
        });
    }
};
