api.controller = function($scope, $window, $location) {
    /* widget controller */
    var c = this;
    var isIE = window.navigator.userAgent.indexOf('Trident/') !== -1;
    c.data.footer = {};
    c.data.isFooterFixed = false;
  
    $scope.$on('ngRepeatFinishedNavLinks', function(ngRepeatFinishedEvent) {
      init();
    });
    
    function init() {

        if (c.data.footer && c.data.footer.menus) {
            Object.keys(c.data.footer.menus).forEach(function(menuType) {
                var menuSection = c.data.footer.menus[menuType];
                if (menuSection) {
                    menuSection.forEach(function(menu) {
                        menu.menuItems = transformMenuItems(menu.menuItems);
                    });
                }
            });
        }

        applyMasonryOnLoad();
    }

   /**
     * Used for capturing positions of columns in the Footer masonry layout.
     * navigationMap : an object with key as left offset in pixel & value as array of footer links located at that left offset.
     */
    c.DELTA_OFFSET = 24;
    $scope.navigationMap = {};
    $scope.keyboardNavRowIndex = 0;
    $scope.keyboardNavColIndex = 0;

    /**
     * This function provides keyboard navigation within Footer
     * @param {Object} event - keyboard event object
     * @see {@link c.initialiseKeyboardNav}
     * @todo change event.which to event.key after end of support for IE11.
     */
    $scope.handleFooterKeyboardEvent = function (event) {
        // If Shift + Tab on 1st link, let default DOM order take control of K/B Navigation & reset c.shiftKeyPressed.
        c.shiftKeyPressed = event.shiftKey;
        var isShiftTabPressedOnFirstLink = c.shiftKeyPressed && event.which === 9 && $scope.keyboardNavRowIndex === 0 && $scope.keyboardNavColIndex === 0;
        if (isShiftTabPressedOnFirstLink || event.which === 16) {
            c.shiftKeyPressed = isShiftTabPressedOnFirstLink ? false : c.shiftKeyPressed;
            return;
        }
        var navMapKeys = Object.keys($scope.navigationMap);

        // If Tab key is pressed on last masonry link and no bottom links are available, let default DOM order take control of K/B Navigation
        var isLastRow = ($scope.keyboardNavRowIndex === $scope.navigationMap[navMapKeys[$scope.keyboardNavColIndex]].length - 1);
        var isLastColumn = ($scope.keyboardNavColIndex === navMapKeys.length - 1);
        var isOnlyTabKeyPress = (event.which === 9 && !c.shiftKeyPressed);
        var areBottomLinksPresent = _.get(c.data.footer, 'menus.bottom_links[0].menuItems.length', 0) > 0 || _.get(c.data.footer, 'menus.social_icons.menuItems.length', 0) > 0;
        if (isLastRow && isLastColumn && isOnlyTabKeyPress && !areBottomLinksPresent) {
          $scope.keyboardNavRowIndex = 0;
          $scope.keyboardNavColIndex = 0;
          return;
        }

        event.preventDefault();
        switch (event.which) {
            case 32: // fall through, click on space or enter key
            case 13:
                $(event.target)[0].click();
                break;

            case 37: // Left arrow key press
                $scope.keyboardNavRowIndex = 0;
                // if on 1st column, go to last column. Otherwise decrease the column to the left one
                $scope.keyboardNavColIndex = ($scope.keyboardNavColIndex === 0) ? navMapKeys.length - 1 : $scope.keyboardNavColIndex - 1;
                break;

            case 38: // Up arrow key press
                var currentRowIndex = $scope.keyboardNavRowIndex;
                var currentColIndex = $scope.keyboardNavColIndex;
                // if not on 1st row, move up a row, otherwise set current row to last link of the column
                $scope.keyboardNavRowIndex = (currentRowIndex === 0) ? ($scope.navigationMap[navMapKeys[currentColIndex]].length - 1) : (currentRowIndex - 1);
                break;

            case 39: // Right arrow key press
                $scope.keyboardNavRowIndex = 0;
                // if not last column, move to next column, else move to 1st column
                $scope.keyboardNavColIndex = ($scope.keyboardNavColIndex + 1 < navMapKeys.length) ? ($scope.keyboardNavColIndex + 1) : 0;
                break;

            case 40: // Down arrow key press
                currentRowIndex = $scope.keyboardNavRowIndex;
                currentColIndex = $scope.keyboardNavColIndex;
                // if on last row, go to 1st row, else move down one row
                $scope.keyboardNavRowIndex = (currentRowIndex === $scope.navigationMap[navMapKeys[currentColIndex]].length - 1) ? 0 : (currentRowIndex + 1);
                break;

            case 9:
                // if shift + tab
                if (c.shiftKeyPressed) {
                    if ($scope.keyboardNavRowIndex != 0) {
                        $scope.keyboardNavRowIndex--;
                    }
                    // if it is 0th row
                    else {
                        $scope.keyboardNavColIndex--;
                        $scope.keyboardNavRowIndex = $scope.navigationMap[navMapKeys[$scope.keyboardNavColIndex]].length - 1;
                    }
                }
                // only tab
                else {
                    // if not on the last row of current column, then increment the row
                    if ($scope.navigationMap[navMapKeys[$scope.keyboardNavColIndex]].length != $scope.keyboardNavRowIndex + 1) {
                        $scope.keyboardNavRowIndex++;
                    }
                    // if on the last row
                    else {
                        // if on last row of last column, then  move to 1st bottom link
                        if ($scope.keyboardNavColIndex === navMapKeys.length - 1) {
                            $('.scrub-footer .sf-bottom a').first().focus();
                            $scope.keyboardNavRowIndex = 0;
                            $scope.keyboardNavColIndex = 0;
                            return;
                        }
                        // but not the last column, then increment column & go to row 0 of next column.
                        $scope.keyboardNavRowIndex = 0;
                        $scope.keyboardNavColIndex++;
                    }
                }
                break;
        }
        $scope.navigationMap[navMapKeys[$scope.keyboardNavColIndex]][$scope.keyboardNavRowIndex].focus();
    };

    /**
     * Helper function for c.initialiseKeyboardNav
     * Searches existing column offsets in range of currentOffset ± DELTA_OFFSET
     * and returns index of the nearest column offset, else -1.
     * @param {Array} columnOffsets - array of left offsets of columns
     * @param {string} currentOffset - current element's left offset
     * @see {@link c.initialiseKeyboardNav}
     */
    var columnSearch = function (columnOffsets, currentOffset) {
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
    c.initialiseKeyboardNav = function () {
        $scope.navigationMap = {};
        var allFooterLinks = $('.masonry-root').find('a');
        for (var index = 0; index < allFooterLinks.length; index++) {
            var currentLink = allFooterLinks.get(index);
            if ($scope.navigationMap.hasOwnProperty(currentLink.offsetLeft))
                $scope.navigationMap[currentLink.offsetLeft].push(currentLink);
            else {
                var _navKeys = Object.keys($scope.navigationMap);
                var _currentOffset = currentLink.offsetLeft;
                var _closestColumn = columnSearch(_navKeys, _currentOffset);
                if (_closestColumn !== -1) {
                    $scope.navigationMap[String(_navKeys[_closestColumn])].push(currentLink);
                } else {
                    $scope.navigationMap[_currentOffset] = [currentLink];
                }
            }
        }
    };

    /* Util functions :: Start */
    var isExternalLink = (function() {
        var absoluteLinkRegx = new RegExp('^(?:[a-z]+:)?//', 'i');
        return function(url) {
            return (url && absoluteLinkRegx.test(url) && url.indexOf(window.location.host) == -1);
        };
    })();
    function transformMenuItems(menuItems) {
        var filteredItems = [];
        if (menuItems)
            menuItems.forEach(function(menuItem) {
                if (menuItem.href) {
                    if (menuItem.url_target) {
                      menuItem.isExternalLink = menuItem.url_target === "_blank";
                    } else {
                      menuItem.isExternalLink = isExternalLink(menuItem.href);
                    }
                    filteredItems.push(menuItem);
                }
            });
        return filteredItems;
    }
    /* Util functions :: End */

    /* Mansonry Layout Utils :: Start */
    var masonryHeight = 0;
    var applyMasonryOnLoad = function() {
        var masonryRoot = $('.masonry-root');
        var noOfColumns = Math.floor(masonryRoot.innerWidth() / convertRemToPixel(minimumWidthRem()));
        var masonryCell = masonryRoot.children();
        var masonryCellSize = masonryCell.size();
        var sfLogoContainer = $('.sf-logo-container');
        
        masonryCell.each( function(){
                $(this).css('order', '1');
                $(this).css('flex-basis', 'auto');
                $(this).css('display', '');
            });
        if (noOfColumns < masonryCellSize) {
            masonryRoot.css('height', 'auto');
            masonryRoot.css('flex-direction','column');
            masonryRoot.css('justify-content', 'flex-start');

            if(noOfColumns > 1) {
                var columns = divideMasonryCellsInColumns(masonryCell, noOfColumns);

                // ...and conquer
                var order = 0;
                columns.forEach(function(column) {
                    column.cells.forEach(function(cell) {
                        cell.css('order', order++);
                    });
                    // set flex-basis of the last cell to fill the
                    // leftover space at the bottom of the column
                    // to prevent the first cell of the next column
                    // to be rendered at the bottom of this column
                    if (column.cells.length)
                        column.cells[column.cells.length - 1].css('flex-basis', column.cells[column.cells.length - 1].innerHeight() + masonryHeight - column.height + 'px');
                });
                setTimeout(function(){
                    columns = divideMasonryCellsInColumns(masonryCell, noOfColumns);
                    masonryRoot.css('height', masonryHeight + 1);
                    if (isIE) {
                        masonryRoot.css('flex-wrap', '');
                    }
                });
            }
        } else {
            masonryRoot.css('height', 'auto');
            masonryRoot.css('flex-direction','row');

            // Space all cells evenly
            if(isIE){
              masonryRoot.css('display', 'flex');
              masonryRoot.css('flex-wrap', 'nowrap');
            }
            $('.masonry-cell').each( function(){
                $(this).css('order', '1');
                $(this).css('flex-basis', 'auto');

                // Space all cells evenly
                $(this).css('flex-basis', 100/(masonryCellSize) + '%');
                if(isIE){
                  $(this).css('display', 'block');
                }
            });
        }
        
        //This overrides default behaviour for non-fixed footer when this specific widget is used
        if(!c.data.isFooterFixed) {
            $('.page').css('display','flex');
            $('.page').css('flex-direction','column');
            $('.body').css('flex','1 0 auto');
        }
        setTimeout(function () {
            c.initialiseKeyboardNav();

            c.HEADER_HEIGHT = parseFloat($window.getComputedStyle($('header')[0]).height);
            c.FOOTER_HEIGHT = parseFloat($window.getComputedStyle($('footer')[0]).height);
            $('main.body').css('min-height', 'calc(100vh - ' + (c.HEADER_HEIGHT + c.FOOTER_HEIGHT) + 'px)');
        });

        $('footer').attr({
            'role': 'contentinfo',
            'aria-label': '${Employee Center Footer}',
            'tabindex': '-1'
        });

        $('footer').focus(function () {
            $('footer').attr({
               'style': 'border:none;box-shadow:none;'
            });
        });

        $('footer').blur(function () {
            $('footer').removeAttr('style');
        });
    };

    function divideMasonryCellsInColumns(masonryCell, noOfColumns) {
        masonryHeight = 0;
        var columns = Array.from(new Array(noOfColumns)).map(function(column) {
                return {
                    'cells': new Array(),
                    'height': 0
                };
            });

            masonryCell.each( function(){
                var minHeight;
                columns.forEach(function(column, i) {
                    if (!i || minHeight > column.height)
                        minHeight = column.height;
                });

                var column = columns.find(function(column) {
                    return column.height === minHeight;
                });
                column.cells.push($(this));
                column.height += $(this).innerHeight();
                if(column.height > masonryHeight) {
                    masonryHeight = column.height;
                }
            });
        return columns;
    }

    /*
     * Return width of navigation group based on device resolution
     */
    function minimumWidthRem() {
        var minColWidth = 22;
        if ($window.innerWidth <= 850)
            minColWidth = 15; // if tablet resolution
        return minColWidth;
    }

    /*
     * Converts rem to pixel. `getComputedStyle` is supported in IE 11 as well
     */
    function convertRemToPixel(rem) {
        return rem * parseFloat(getComputedStyle(document.documentElement).fontSize);
    }


    // Subscribe to resize
    var resizeWindow = function() {
        applyMasonryOnLoad();
    };
    var appWindow = angular.element($window);
    appWindow.bind('resize', _.debounce(resizeWindow, 500));

    // To detect text-only zoom
    var fontSize = getComputedStyle(document.documentElement).fontSize;
    setInterval(function() {
        var currentFontSize = getComputedStyle(document.documentElement).fontSize;
        if(fontSize !== currentFontSize) {
            fontSize = currentFontSize;
            applyMasonryOnLoad();
        }
    }, 500);

    /* Mansonry Layout Utils :: END */

    function loadData() {
        c.data.action = "loadData";
        c.server.update();
    }
    $scope.$applyAsync(loadData);
    
    // No Footer for ViewAs Pages
    c.evaluateFooterVisibilityForViewAs = function () {
      var currentUrl = $location.url();
      var params = $location.search();
      $scope.showFooter = true;
      if ((params && params.id && (currentUrl.includes("ec_view_as") || currentUrl.includes("nowassistselfservice"))))
        $scope.showFooter = false;
    };
    
    $scope.$on('sp_loading_indicator', function(e, value) {
      $scope.loadingIndicator = value;
      // Evaluate footer visibility once the page has completed loading.
      if(!value)
        c.evaluateFooterVisibilityForViewAs();
    });
};
