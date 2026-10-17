api.controller = function(spUtil, $scope, $timeout, $window) {
    var c = this;
    c.more_title = "${More menu}";

    function isRefreshNeededForChanges(changes) {
        var isNeeded = changes.length > 0 && !(
            changes.length == 1 && (
                changes[0] == 'comments' || changes[0] == 'work_notes' || changes[0] == 'task_percent_complete'
            )
        );
        return isNeeded;
    }
    c.KEYS = {
        LEFT: 37,
        RIGHT: 39
    };
    //Click First visible Tab
    function clickFirstVisibleTab() {
        var uibTabs = $('#std-uib-tabset'.concat(c.data.tabName)).children('ul');
        var firstVisibleTab = uibTabs.children('.secondary-info-tab:first').find('>a');
        $timeout(function() {
            firstVisibleTab[0].click();
        });
    }
    //Click dropdown menuitem on pressing right from tabs
    c.keyUpOnTabs = function(e) {
        var uibTabs = $('#std-uib-tabset'.concat(c.data.tabName)).children('ul');
        if (e.keyCode == c.KEYS.RIGHT && uibTabs && uibTabs.children('.secondary-info-tab:not(.hide-item):last')[0] == e.currentTarget) {
            var selectables = $('#dropDownMenu'.concat(c.data.tabName)).find('.hide-item:last').next();
            if (selectables && selectables.length != 0) {
                $timeout(function() {
                    selectables[0].click();
                });
            } else
                clickFirstVisibleTab();
        }
    }
    c.keyUpOnDropDown = function(e) {
        var selectedMenuItem = $('#dropDownMenu'.concat(c.data.tabName)).find('.tick-mark').parent();
        if (e.keyCode == c.KEYS.RIGHT) {
            var rightChild = getNextOrPrevChild(selectedMenuItem.next(), true); // Get next child of selected menu item
            if (rightChild) {
                $timeout(function() {
                    rightChild[0].click();
                });
            } else
                clickFirstVisibleTab(); // Move focus to first visible tab when no more menu Items present in dropdown
        } else if (e.keyCode == c.KEYS.LEFT) {
            var leftChild = getNextOrPrevChild(selectedMenuItem.prev(), false); // Get previous child of selected menu item
            if (leftChild) {
                $timeout(function() {
                    leftChild[0].click()
                });
            }
        }
    }

    function getNextOrPrevChild(child, right) {
        if (right && child && child.next().length != 0 && child[0].tagName != 'LI') // To handle if next child is tooltip
            return child.next();
        else if (!right && child && child.prev().length != 0 && child[0].tagName != 'LI') // To handle if prev child is tooltip
            return child.prev();
        else if (child && child.length != 0)
            return child;
    }
    var primaryWidth = 0;
    $scope.selectedTab = null;
    spUtil.recordWatch($scope, $scope.data.table, "sys_id=" + $scope.data.sysId, function(name) {
        if (isRefreshNeededForChanges(name.data.changes))
            $scope.server.get().then(function(response) {
                if (!_.isEqual($scope.data, response.data))
                    _.merge($scope.data, response.data);
                $timeout(function() {
                    doAdapt();
                    c.more_title = "${More menu}";
                }, 0);
            });
    });
    var doAdapt = function(isSelectedTabPrimary) {
        if (c.data.tabs.length == 0)
            return;
        var selectedTab = $scope.selectedTab;
        var tabSet = document.getElementById('std-uib-tabset'.concat(c.data.tabName));
        if (tabSet) {
            var primaryItems = tabSet.getElementsByClassName("secondary-info-tab");
            var moreItems = tabSet.getElementsByClassName("secondary-info-more-tab");
            // reveal all items for the calculation
            Object.keys(primaryItems).forEach(function(item) {
                primaryItems[item].classList.remove('hide-item');
            });

            // hide items that won't fit in the Primary
            var stopWidth = 0;
            var primaryWidth = 0;
            if (document.getElementById('std-uib-tabset'.concat(c.data.tabName))) {
                primaryWidth = document.getElementById('std-uib-tabset'.concat(c.data.tabName)).offsetWidth;
            }
            var includeInMenuItem;
            Object.keys(primaryItems).forEach(function(item, i) {
                var tabSysId = c.data.tabs[i] && c.data.tabs[i].tabSysId ? c.data.tabs[i].tabSysId : i;
                primaryItems[item].id = 'secondary-info-tab-'.concat(tabSysId, c.data.tabName);
                moreItems[item].id = 'secondary-info-more-tab-'.concat(tabSysId, c.data.tabName);
                moreItems[item].children[0].setAttribute('role', "option");
                if (primaryWidth >= stopWidth + primaryItems[item].offsetWidth + 20 && !includeInMenuItem) {
                    stopWidth += primaryItems[item].offsetWidth;
                    moreItems[item].classList.add('hide-item');
                    primaryItems[item].classList.remove('hide-item');
                } else if (!includeInMenuItem && (primaryWidth - stopWidth - 50) < document.getElementById('more-btn'.concat(c.data.tabName)).offsetWidth) {
                    includeInMenuItem = true;
                    var moreBtnWidth = document.getElementById('more-btn'.concat(c.data.tabName)).offsetWidth;
                    var availableWidth = primaryWidth - stopWidth - 50;
                    for (var j = 0; j < i && availableWidth < moreBtnWidth; j++) {
                        availableWidth += primaryItems[item - j - 1].offsetWidth;
                        showItemInMenu(item - j - 1);
                    }
                    showItemInMenu(item);
                } else {
                    includeInMenuItem = true;
                    showItemInMenu(item);
                }
            });
            if (!includeInMenuItem) {
                $('#moreDropdown'.concat(c.data.tabName)).addClass('hide-item');
            } else {
                $('#moreDropdown'.concat(c.data.tabName)).removeClass('hide-item');
            }

            function showItemInMenu(index) {
                primaryItems[index].classList.add('hide-item');
                moreItems[index].classList.remove('hide-item');
            }
            // show the selected tab and remove from more after clicked
            if (selectedTab && document.getElementById('secondary-info-tab-'.concat(selectedTab.tabSysId, c.data.tabName))) {
                var tabItem = document.getElementById('secondary-info-tab-'.concat(selectedTab.tabSysId, c.data.tabName));
                var menuItem = document.getElementById('secondary-info-more-tab-'.concat(selectedTab.tabSysId, c.data.tabName));
                if (!menuItem.className.includes("hide-item")) { //If menu item is present in the dropdown and is the selectedTab
                    menuItem.children[0].classList.add("tick-mark");
                    menuItem.parentElement.setAttribute('aria-activedescendant', menuItem.id);
                    menuItem.children[0].setAttribute('aria-selected', true);
                    addSelected(menuItem); //Added for accessibilty
                }
                setTimeout(function() {
                    if (!isSelectedTabPrimary)
                        tabItem.children[0].click();
                }, 0);
            }
        }
    }
    // adapt on load
    $timeout(function() {
        c.more_title = "${More menu}";
        doAdapt();
    }, 0);
    var appWindow = angular.element($window);
    var loadWindow = function() {
        // handle load event
        c.more_title = "${More menu}";
        doAdapt();
    };
    appWindow.bind('load', _.debounce(loadWindow, 300));
    var resizeWindow = function() {
        // adapt on window resize
        $timeout(function() {
            renameMoreTab($scope.selectedTab);
            doAdapt();
        });
        if (prevTab && prevTab.childNodes[1])
            prevTab.removeChild(prevTab.childNodes[1]);
    };

    window.addEventListener("resize", _.debounce(resizeWindow, 300));
    var prevTab;

    function renameMoreTab(tabSelected) {
        var moreBtn = document.getElementById('more-btn'.concat(c.data.tabName));
        var selectedItem;
        if (tabSelected)
            selectedItem = document.getElementById('secondary-info-more-tab-'.concat(tabSelected.tabSysId, c.data.tabName));
        var menuItemHidden;
        if (tabSelected && selectedItem)
            menuItemHidden = selectedItem.className.includes("hide-item");
        if (moreBtn && tabSelected && !menuItemHidden) {
            moreBtn.removeAttribute('tabindex'); //As menuitem is selected, now dropdown should appear in tabbing sequence
            c.more_title = tabSelected.name;
            if (!moreBtn.className.includes('active-dropdown'))
                moreBtn.className += ' active-dropdown';
        } else if (moreBtn && tabSelected && menuItemHidden) {
            c.more_title = "${More menu}";
            $('#more-btn'.concat(c.data.tabName)).removeClass("active-dropdown");
            moreBtn.setAttribute('tabindex', '-1'); //Reset tabindex -1
        }
    }

    function doOperationOnPrevTab(prevTab) {
        if (prevTab) { //Remove the above added attr from previous selected tab on change of selection
            prevTab.setAttribute('aria-selected', false);
            prevTab.classList.remove("tick-mark");
            if (prevTab.childNodes[1])
                prevTab.removeChild(prevTab.childNodes[1]);
        }
    }

    function addSelected(menuItem) { // Add span for reading the selected menu item in dropdown
        var textSpan = document.createElement("span");
        textSpan.innerHTML = "${ Selected}";
        textSpan.classList.add("sr-only");
        menuItem.children[0].appendChild(textSpan);
    }
    $scope.tabSelectedInMore = function(tab) {
        doOperationOnPrevTab(prevTab);
        prevTab = document.getElementById('secondary-info-more-tab-'.concat(tab.tabSysId, c.data.tabName)).children[0];
        $scope.selectedTab = tab;
        renameMoreTab($scope.selectedTab);
        $timeout(function() {
            doAdapt();
        });
        var moreBtn = document.getElementById('more-btn'.concat(c.data.tabName));
        moreBtn.removeAttribute('tabindex'); //As menuitem is selected, now dropdown should appear in tabbing sequence
        if (moreBtn)
            moreBtn.focus();
    }
    $scope.onTabClick = function(tab) {
        renameMoreTab(tab);
        doOperationOnPrevTab(prevTab);
        var selectedItem = document.getElementById('secondary-info-more-tab-'.concat(tab.tabSysId, c.data.tabName));
        if (selectedItem)
            prevTab = selectedItem.children[0];
        $scope.selectedTab = tab;
        $timeout(function() {
            doAdapt(true);
        });
        $scope.$emit('sp.components.resize');
        var moreDropdown = document.getElementById('moreDropdown'.concat(c.data.tabName));
        if (moreDropdown) {
            $('#moreDropdown'.concat(c.data.tabName)).tooltip('hide');
            if (moreDropdown.className.includes("open"))
                moreDropdown.classList.remove('open');
        }
    };
}
