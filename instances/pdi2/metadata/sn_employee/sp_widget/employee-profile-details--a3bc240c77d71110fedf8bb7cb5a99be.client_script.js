api.controller = function($scope, $timeout, $window) {
    var c = this;
    c.more_title = c.data.moreMsg;
    $scope.selectedTab = null;
    $scope.widgets = {};
    $scope.selectedSideBarItemIndex = 0;
    $scope.stickySideBarTop = 0;
    var firstLoad = true;
    var tabsScrollPosition = {};
    var tabsSelectedIndex = {};
    var initialTopPosition = null;
    var shiftFocusToWidget = false;
    var isScrolling;

    if (c.data.tabIdFromUrl) {
        $scope.$emit('ec.breadcrumb.showback');
    }

    $scope.getWidgets = function(tabId) {
        var widgets = $scope.widgets[tabId];
        return widgets ? widgets : [];
    };

    $scope.$on('updateWidgetVisibility', function(event, updatedVisibilityPreferences) {
        var tabId = document.getElementById('profile_widget_' + updatedVisibilityPreferences.widgetMappingId).getAttribute('data-tab');
        var widgetList = $scope.widgets[tabId] ? $scope.widgets[tabId] : [];
        for (var i = 0; i < widgetList.length; i++) {
            if (updatedVisibilityPreferences.widgetMappingId == widgetList[i].id) {
                var publicProfileWidget = widgetList[i].widgetData.data.publicProfileWidget;
                if (publicProfileWidget) {
                    publicProfileWidget.data.accessibilityMsg = updatedVisibilityPreferences.accessibilityMsg;
                    publicProfileWidget.data.widgetVisibility = updatedVisibilityPreferences.widgetVisibility;
                }
                break;
            }
        }
    });

    $scope.setTabLoaded = function(tabId) {
        //show flat page when there is only one tab
        if (c.data.tabs.length == 1) {
            var tabSet = document.getElementById('std-uib-tabset');
            var tabs = tabSet.getElementsByClassName('nav-tabs');
            tabs[0].remove();
        }

        if ($scope.isTabLoaded(tabId)) {
            return;
        }

        //To run the doAdapt on first load
        if (firstLoad) {
            $timeout(function() {
                firstLoad = false;
                $scope.selectedTab = tabId;
                doAdapt();
            }, 100);
        }

        $scope.server.get({
            "tabId": tabId
        }).then(function(response) {
            $scope.widgets[tabId] = response.data.widgets;
            var interval = setInterval(function() {
                if (areWidgetsLoadedForTab(tabId)) {
                    /*if (c.data.tabIdFromUrl == tabId) {
                        $scope.widgets[tabId].forEach(function(widget, index) {
                            if (widget.selected)
                                _scrollToWidget(widget.id, index);
                        });
                    }else*/
                    if (initialTopPosition == null) {
                        var currContainer = Array.from(document.getElementsByClassName('tab-container')).filter(
                            function(container) {
                                return container.dataset.tab == tabId;
                            });
                        initialTopPosition = currContainer[0].getBoundingClientRect().top;
                    }

                    retainPreviousScrollPosition();
                    selectFirstSideBarItem();
                    clearInterval(interval);
                }
            }, 300);
        });
    };

    function areWidgetsLoadedForTab(tabId) {
        var widgets = document.getElementsByClassName('profile-widget');
        widgets = Array.from(widgets).filter(function(widget) {
            return widget.dataset.tab == tabId;
        });
        for (i = 0; i < widgets.length; i++) {
            if (widgets[i].children[0].tagName == 'SP-WIDGET')
                return false;
        }
        return true;
    }

    $scope.isTabLoaded = function(tabId) {
        return $scope.widgets.hasOwnProperty(tabId);
    };

    c.KEYS = {
        LEFT: 37,
        RIGHT: 39,
        SPACE: 32,
        ENTER: 13,
        TAB: 9
    };

    //Click dropdown menuitem on pressing right from tabs
    c.keyUpOnTabs = function(e, tabId) {
        var uibTabs = $('#std-uib-tabset').children('ul');
        if (e.keyCode == c.KEYS.RIGHT && uibTabs) {
            if (uibTabs.children('.profile-tab:not(.hide-item):last')[0] === e.currentTarget) {
                clickFirstVisibleTab();
            } else {
                clickRightSibling(e.currentTarget);
            }

        } else if (e.keyCode == c.KEYS.LEFT && uibTabs) {
            if (uibTabs.children('.profile-tab:not(.hide-item):first')[0] === e.currentTarget) {
                clickLastVisibleTab();
            } else {
                clickLeftSibling(e.currentTarget);
            }
        }
    };

    //Click first visible Tab
    function clickFirstVisibleTab() {
        var firstVisibleTab = $(".profile-tab:not(.hide-item):first").find('>a');
        $timeout(function() {
            firstVisibleTab[0].click();
            firstVisibleTab[0].focus();
        });
    }

    //Click last visible Tab
    function clickLastVisibleTab() {
        var lastVisibleTab = $(".profile-tab:not(.hide-item):last").find('>a');
        $timeout(function() {
            lastVisibleTab[0].click();
            lastVisibleTab[0].focus();
        });
    }

    //Click left visible sibling tab
    function clickLeftSibling(element) {
        var leftSibling = $(element).prevAll(":not(.hide-item)").first().find(">a");
        $timeout(function() {
            leftSibling[0].click();
            leftSibling[0].focus();
        });
    }

    //Click right visible sibling tab
    function clickRightSibling(element) {
        var rightSibling = $(element).nextAll(":not(.hide-item)").first().find(">a");
        $timeout(function() {
            rightSibling[0].click();
            rightSibling[0].focus();
        });
    }

    var doAdapt = function(shouldFocusTab) {

        if (c.data.tabs.length == 0)
            return;

        var tabSet = document.getElementById('std-uib-tabset');
        var selectedTabId = $scope.selectedTab;
        if (tabSet && selectedTabId) {
            $('#moreDropdown').removeClass('hide-item');
            $('#moreDropdown').addClass('hide-from-view');
            var primaryItems = tabSet.getElementsByClassName("profile-tab");
            var moreItems = tabSet.getElementsByClassName("profile-more-tab");
            var selectedItemWidth = 0;
            var selectedItemIndex;
            // reveal all items for the calculation
            Object.keys(primaryItems).forEach(function(item, i) {
                primaryItems[item].classList.remove('hide-item');

                var tabId = c.data.tabs[i] && c.data.tabs[i].tabId ? c.data.tabs[i].tabId : i;
                primaryItems[item].id = 'profile-tab-'.concat(tabId);
                primaryItems[i].childNodes[1].setAttribute("aria-label", primaryItems[i].dataset.tabname);
                moreItems[item].id = 'profile-more-tab-'.concat(tabId);
                moreItems[item].children[0].setAttribute("role", "menuitem");
                moreItems[item].children[0].removeAttribute("aria-selected");

                if (primaryItems[i].id === 'profile-tab-'.concat(selectedTabId)) {
                    selectedItemWidth = primaryItems[i].offsetWidth;
                    selectedItemIndex = i;
                }
            });

            // hide items that won't fit in the Primary
            var primaryWidth = document.getElementById('std-uib-tabset').offsetWidth;
            var includeInMenuItem;

            //Selected tab would always be in the view. 
            var stopWidth = selectedItemWidth;
            var tabLimit = c.data.tabLimit ? c.data.tabLimit - 1 : c.data.tabLimit;

            Object.keys(primaryItems).forEach(function(item, i) {

                if (primaryItems[item].id === 'profile-tab-'.concat(selectedTabId)) {
                    return;
                }

                if (!includeInMenuItem && tabLimit > 0 && primaryWidth >= stopWidth + primaryItems[item].offsetWidth + 20) {
                    stopWidth += primaryItems[item].offsetWidth;
                    moreItems[item].classList.add('hide-item');
                    primaryItems[item].classList.remove('hide-item');
                    tabLimit--;
                } else if (!includeInMenuItem && (tabLimit == 0 || (primaryWidth - stopWidth - 50) < document.getElementById('more-btn').offsetWidth)) {
                    includeInMenuItem = true;
                    var moreBtnWidth = document.getElementById('more-btn').offsetWidth;
                    var availableWidth = primaryWidth - stopWidth - 50;
                    for (var j = 0; j < i && availableWidth < moreBtnWidth; j++) {
                        if (item - j - 1 === selectedItemIndex) {
                            continue;
                        }
                        availableWidth += primaryItems[item - j - 1].offsetWidth;
                        showItemInMenu(item - j - 1);
                    }
                    showItemInMenu(item);
                    if (availableWidth < moreBtnWidth) {
                        showItemInMenu(selectedItemIndex);
                    }
                } else {
                    includeInMenuItem = true;
                    showItemInMenu(item);
                }

            });
            if (primaryItems.length > 0)
                primaryItems[selectedItemIndex].classList.remove('hide-item');
            if (moreItems.length > 0)
                moreItems[selectedItemIndex].classList.add('hide-item');
            if (!includeInMenuItem) {
                $('#moreDropdown').addClass('hide-item');
                $('#moreDropdown').removeClass('hide-from-view');
            } else {
                $('#moreDropdown').removeClass('hide-item');
                $('#moreDropdown').removeClass('hide-from-view');
            }

            function showItemInMenu(index) {
                primaryItems[index].classList.add('hide-item');
                moreItems[index].classList.remove('hide-item');
            }

            if (includeInMenuItem) {
                var primaryItemsLength = 0;
                for (var i = 0; i < primaryItems.length; i++) {
                    primaryItemsLength += primaryItems[i].offsetWidth;
                }
                var moreTabLength = document.getElementById('moreDropdown').offsetWidth;
                var moreDistanceFromLeft = primaryItemsLength + moreTabLength / 2;

                if (moreDistanceFromLeft >= tabSet.offsetWidth / 2) { //If the "More" tab is in the right half of widget, we display the dropdown on left side
                    $('#dropDownMenu').removeClass('pull-left');
                    $('#dropDownMenu').addClass('pull-right');
                } else { //If the "More" tab is in the left half of widget, we display the dropdown on right side
                    $('#dropDownMenu').removeClass('pull-right');
                    $('#dropDownMenu').addClass('pull-left');
                }
            }
            $timeout(function() {
                if (shouldFocusTab) {
                    $("#profile-tab-" + selectedTabId).find(">a").focus();
                }
            });
        }
    };

    // adapt on load
    $timeout(function() {
        resizeObserverForTabs();
        doAdapt();
    }, 0);

    var appWindow = angular.element($window);

    var resizeWindow = function() {
        // adapt on window resize
        $timeout(function() {
            doAdapt();
        });
    };

    if (!c.data.isMobile) {
        appWindow.bind('resize', _.debounce(resizeWindow, 300));
    }

    function resizeObserverForTabs() {
        var profileTab = document.querySelector(".profile-tab");
        //fix for firefox/chrome on cmd + text zoom increase
        if (window.ResizeObserver) {
            var resizeObserver = new ResizeObserver(function(entries) {
                if (entries) {
                    doAdapt();
                }
            });

            if (profileTab)
                resizeObserver.observe(profileTab);
        }
    }

    $scope.keyUpOnMoreTab = function(e, tab) {
        if (e.keyCode == c.KEYS.SPACE) {
            $scope.tabSelectedInMore(tab);
        }
    };

    $scope.tabSelectedInMore = function(tab) {
        var profileTab = $("#profile-tab-" + tab.tabId).find('>a');
        $timeout(function() {
            profileTab.click();
        });
    };

    function _onTabClick(tab) {
        if (tab)
            $scope.selectedTab = tab.tabId;
        var shouldFocusTab = $(document.activeElement).parent().hasClass("profile-tab") || $(document.activeElement).parent().hasClass("profile-more-tab");
        $timeout(function() {
            doAdapt(shouldFocusTab);
        });
        $scope.$emit('sp.components.resize');
        var moreDropdown = document.getElementById('moreDropdown');
        if (moreDropdown) {
            $('#moreDropdown').tooltip('hide');
            if (moreDropdown.className.includes("open"))
                moreDropdown.classList.remove('open');
        }

        $timeout(function() {
            retainPreviousScrollPosition(tab);
        });
    }

    $scope.onTabClick = function(tab) {
        _onTabClick(tab);
    };

    function isSideBarContentLoaded(tabId) {
        try {
            var sideBarElements = document.getElementsByClassName('sticky-container');
            var currSideBar = Array.from(sideBarElements).filter(
                function(sideBar) {
                    return sideBar.dataset.tab == tabId;
                });
            return currSideBar[0].getBoundingClientRect().height != 0;
        } catch (err) {}
    }

    function getSelectedSideBarItemIndex() {
        var selectedSideBarItem = document.getElementsByClassName("side-bar-item-selected");
        if (selectedSideBarItem && selectedSideBarItem.length) {
            var selectedSideBarItemID = selectedSideBarItem[0].id;
            return selectedSideBarItemID.slice(-1);
        }
        return 0;
    }

    $scope.onTabDeselect = function(tabId) {
        tabsSelectedIndex[tabId] = getSelectedSideBarItemIndex();
        captureScrollPosition();
    };

    function retainPreviousScrollPosition(tab) {
        try {
            var ele = document.getElementsByClassName('flex-grow page sp-scroll')[0];
            if (isNaN(tabsScrollPosition[$scope.selectedTab])) {
                var currContainer = Array.from(document.getElementsByClassName('tab-container')).filter(
                    function(container) {
                        return container.dataset.tab == $scope.selectedTab;
                    });
                if (!currContainer)
                    return;
                currContainer = currContainer[0].getBoundingClientRect().top;
                if (Math.floor(currContainer) < Math.floor($scope.stickySideBarTop))
                    ele.scroll(0, initialTopPosition - $scope.stickySideBarTop);
            } else {
                var scrollLength = tabsScrollPosition[$scope.selectedTab] > 0 ? (initialTopPosition - tabsScrollPosition[$scope.selectedTab]) : (initialTopPosition + Math.abs(tabsScrollPosition[$scope.selectedTab]))
                ele.scroll(0, scrollLength);
            }

            if (tabsSelectedIndex[$scope.selectedTab]) {
                $scope.selectedSideBarItemIndex = tabsSelectedIndex[$scope.selectedTab];
                $timeout(function() {
                    if (areWidgetsLoadedForTab($scope.selectedTab) && !isSideBarContentLoaded($scope.selectedTab) && tab) {
                        _onTabClick();
                    }
                    selectSideBarItem(tabsSelectedIndex[$scope.selectedTab]);
                });
            }

        } catch (err) {}
    }

    function _scrollToWidget(widgetId, index) {
        var ele = document.getElementsByClassName('flex-grow page sp-scroll')[0];
        var widget = document.getElementById("profile_widget_" + widgetId);
        widgetOffset = widget.getBoundingClientRect().y;
        ele.scrollBy({
            top: widgetOffset - $scope.stickySideBarTop,
            left: 0,
            behavior: "smooth",
        });

        selectSideBarItem(index);
        $scope.selectedSideBarItemIndex = index;
        tabsSelectedIndex[$scope.selectedTab] = index;
    }

    $scope.onSideBarItemClick = function(event, widgetId, index) {
        if (event.detail > 0) // for click event shifting focus only after TAB. For ENTER this 0. 
            shiftFocusToWidget = true;
        _scrollToWidget(widgetId, index);
    };

    function focusToWidget(widgetId) {
        var widget = document.getElementById("profile_widget_" + widgetId);
        var focusableElements = widget.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        for (i = 0; i < focusableElements.length; i++) {
            if (focusableElements[i].getBoundingClientRect().height > 0) {
                focusableElements[i].focus({
                    preventScroll: true,
                    focusVisible: true
                });
                return;
            }
        }
    }

    $scope.sideBarItemKeyDown = function(event, widgetId, index) {
        if (event.keyCode == c.KEYS.TAB) {
            updateARIAAttributes(index);

            if (shiftFocusToWidget) {
                event.preventDefault();
                focusToWidget(widgetId);
                shiftFocusToWidget = false;
            }
        }
    };

    $scope.sideBarItemKeyUp = function(event, widgetId) {
        if (event.keyCode == c.KEYS.ENTER) {
            focusToWidget(widgetId);
        }
    };

    $scope.isWidgetVisible = function(widgetId) {
        var widget = document.getElementById("profile_widget_" + widgetId);
        var widgetHeight = widget ? widget.getBoundingClientRect().height : 0;
        if (widgetHeight)
            return true;
    };

    function selectFirstSideBarItem() {
        try {
            var selectedSideBarItem = document.getElementsByClassName("side-bar-item-selected");
            if (selectedSideBarItem && selectedSideBarItem.length) {
                selectedSideBarItem[0].classList.remove('side-bar-item-selected');
            }

            var SideBarItems = document.getElementsByClassName("side-bar-item");
            for (i = 0; i < SideBarItems.length; i++) {
                var leftNavItem = document.getElementById('left_nav_panel_' + i);
                if (leftNavItem) {
                    tabsSelectedIndex[$scope.selectedTab] = i;
                    leftNavItem.classList.add('side-bar-item-selected');
                    return;
                }
            }
        } catch (err) {}
    }

    function selectSideBarItem(index) {
        try {
            var selectedSideBarItem = document.getElementsByClassName("side-bar-item-selected");
            if (selectedSideBarItem && selectedSideBarItem.length) {
                selectedSideBarItem[0].classList.remove('side-bar-item-selected');
            }
            var leftNavItem = document.getElementById('left_nav_panel_' + index);
            leftNavItem.classList.add('side-bar-item-selected');
        } catch (err) {}
    }

    function handleSideBarSelection(e) {
        try {
            var widgets = $scope.widgets[$scope.selectedTab];
            if (!widgets)
                return;
            for (i = 0; i < widgets.length; i++) {
                var widgetId = 'profile_widget_' + widgets[i].id;
                var widgetTop = document.getElementById(widgetId).getBoundingClientRect().top;
                var widgetHeight = document.getElementById(widgetId).getBoundingClientRect().height;
                if ((Math.abs(widgetTop) + ($scope.stickySideBarTop - 22 + 1) < Math.abs(widgetHeight)) || (widgetHeight > 0 && widgetTop > 0)) { //24 represents the margin as getBoundingClientRect doesn't include margin
                    selectSideBarItem(i);
                    return;
                }
            }
        } catch (err) {}
    }

    function scrollEvent(e) {
        handleSideBarSelection(e);
    }

    $scope.setStickyProperties = function(index) {
        var elements = document.getElementsByClassName('sticky-container side-bar');
        for (i = 0; i < elements.length; i++) {
            elements[i].style.top = $scope.stickySideBarTop + 'px';
        }
    };

    $timeout(function() {
        var navTabs = document.getElementsByClassName('nav nav-tabs')[0];
        if (navTabs)
            $scope.stickySideBarTop = navTabs.offsetHeight + 32; //32 is the default top margin for side bar sticky container.
        else
            $scope.stickySideBarTop = 32;
        var spPageRoot = document.getElementsByClassName('sp-page-root page')[0];
        //spPageRoot.style.position = 'absolute';
        //spPageRoot.style.height = '100%';

    });

    function captureScrollPosition() {
        try {
            var scrolledPosition = document.getElementById('tab_container_' + $scope.selectedTab).getBoundingClientRect().top;
            if (scrolledPosition != initialTopPosition) //ignoring if no scroll happend
                tabsScrollPosition[$scope.selectedTab] = scrolledPosition;
        } catch (err) {
            console.log('Error in captureScrollPosition: ' + err);
        }
    }

    function updateARIAAttributes(index) {
        try {
            var sideBarItems = document.getElementsByClassName("side-bar-item");
            for (i = 0; i < sideBarItems.length; i++) {
                sideBarItems[i].childNodes[0].setAttribute('aria-selected', "false");
            }
            sideBarItems[index].childNodes[0].setAttribute('aria-selected', "true");
        } catch (err) {
            console.log('Error in updateARIAAttributes: ' + err);
        }
    }

    function executeOnScrollEnd() {
        if ($scope.selectedSideBarItemIndex >= 0) {
            selectSideBarItem($scope.selectedSideBarItemIndex);
            $scope.selectedSideBarItemIndex = -1;
        }
    }

    function detectScrollEnd() {
        window.clearTimeout(isScrolling);
        isScrolling = setTimeout(function() {
            executeOnScrollEnd();
        }, 100);
    }

    $scope.setListeners = function(tab) {
        var ele = document.getElementsByClassName('flex-grow page sp-scroll')[0];

        ele.addEventListener("scroll", function(e) {
            scrollEvent(e);
            detectScrollEnd();
        })

        ele.addEventListener("focusin", function(e) {
            try {
                if (e.target.id.includes('side_bar_button'))
                    updateARIAAttributes(e.target.getAttribute("index"));
            } catch (err) {}
        });
    };
}
