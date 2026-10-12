function(spUtil, $scope, $timeout, $window, $log) {
    function isRefreshNeededForChanges(changes) {
        var isNeeded = changes.length > 0 && !(
            changes.length == 1 && (
                changes[0] == 'comments' || changes[0] == 'work_notes' || changes[0] == 'task_percent_complete'
            )
        );
        return isNeeded;
    }
    var c = this;

    c.KEYS = {
        LEFT: 37,
        RIGHT: 39
    };

    //Click First visible Tab
    function clickFirstVisibleTab() {
        var uibTabs = $('#std-uib-tabset').children('ul');
        var firstVisibleTab = uibTabs.children('.uib-vis-tab:first').find('>a');
        $timeout(function() {
            firstVisibleTab[0].click();
        });
    }
    //Click dropdown menuitem on pressing right from tabs
    c.keyUpOnTabs = function(e) {
        var uibTabs = $('#std-uib-tabset').children('ul');
        if (e.keyCode == c.KEYS.RIGHT && uibTabs && uibTabs.children('.uib-vis-tab:not(.hide-item):last')[0] == e.currentTarget) {
            var selectables = $('#dropDownMenu').find('.hide-item:last').next();
            if (selectables && selectables.length != 0) {
                $timeout(function() {
                    selectables[0].click();
                });
            } else
                clickFirstVisibleTab();
        }
    }

    c.keyUpOnDropDown = function(e) {
        var selectedMenuItem = $('#dropDownMenu').find('.tick-mark').parent();
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

    var isThrottlingRefresh = false;
    var wasRefreshInvoked = false;

    function performRefresh() {
        if (isThrottlingRefresh) {
            wasRefreshInvoked = true;
            return;
        }

        isThrottlingRefresh = true;
        $scope.server.get().then(function(response) {
            if (!_.isEqual($scope.data, response.data)) {
                // Retain the journal entry before refresh
                var journalEntry = '';
                $scope.data.tabs.forEach(function(tab) {
                    if (tab.type == 'activity' && tab.widget.data.journalEntry) {
                        journalEntry = tab.widget.data.journalEntry;
                        return;
                    }
                })
                _.assign($scope.data, response.data);
                // Re-assign retained journal entry to the scope
                if (journalEntry) {
                    $scope.data.tabs.forEach(function(tab) {
                        if (tab.type == 'activity') {
                            tab.widget.data.journalEntry = journalEntry;
                            return;
                        }
                    })
                }
            }
            $timeout(function() {
                doAdapt();
                c.more_title = "${Standard_ticket_more_menu}";
            }, 0);

            $timeout(function() {
                isThrottlingRefresh = false;
                if (wasRefreshInvoked) {
                    wasRefreshInvoked = false;
                    performRefresh();
                }
            }, c.data.refreshThrottleThreshold);
        });
    }

    if (!c.data.disableRecordWatcher)
        spUtil.recordWatch($scope, $scope.data.table, "sys_id=" + $scope.data.sys_id, function(name) {
            if (isRefreshNeededForChanges(name.data.changes)) performRefresh();
        });


    var doAdapt = function(isSelectedTabNotPrimary) {
        if (!c.data.canRead && c.data.tabs.length == 0)
            return;

        var selectedTab = $scope.selectedTab;
        var primaryItems = document.getElementsByClassName("uib-vis-tab");
        var moreItems = document.getElementsByClassName("uib-more-tab");

        // reveal all items for the calculation
        Object.keys(primaryItems).forEach(function(item) {
            primaryItems[item].classList.remove('hide-item');
        });

        // hide items that won't fit in the Primary
        var stopWidth = 0;

        if (document.getElementById("std-uib-tabset")) {
            primaryWidth = document.getElementById("std-uib-tabset").offsetWidth;
        }
        var includeInMenuItem;
        var actualPossibleWidth = primaryWidth;
        Object.keys(primaryItems).forEach(function(item, i) {
            primaryItems[item].id = 'uib-st-tab-' + c.data.tabs[i].order;
            moreItems[item].id = 'uib-more-tab-' + c.data.tabs[i].order;
            moreItems[item].children[0].setAttribute('role', "option");
            if (primaryWidth >= stopWidth + primaryItems[item].offsetWidth && !includeInMenuItem) {
                stopWidth += primaryItems[item].offsetWidth;
                moreItems[item].classList.add('hide-item');
                primaryItems[item].classList.remove('hide-item');
            } else if (primaryItems[item] == primaryItems[primaryItems.length - 1]) {
                document.getElementById("more-btn-text").style.maxWidth = (primaryItems[item - 1].offsetWidth + actualPossibleWidth) - stopWidth - 50 + 'px';
                includeInMenuItem = true;
                showItemInMenu(item - 1);
                showItemInMenu(item);
            } else if (actualPossibleWidth - stopWidth < parseInt(window.getComputedStyle(document.getElementById("more-btn"), null).getPropertyValue('min-width'))) {
                showItemInMenu(item - 1);
            } else {
                var moreBtnWidth = 124;
                document.getElementById("more-btn-text").style.maxWidth = actualPossibleWidth - stopWidth - moreBtnWidth - 50 + 'px';
                includeInMenuItem = true;
                showItemInMenu(item);
            }
        });

        function showItemInMenu(index) {
            primaryItems[index].classList.add('hide-item');
            moreItems[index].classList.remove('hide-item');
        }
        // show the selected tab and remove from more after clicked
        if (selectedTab && document.getElementById('uib-st-tab-' + selectedTab.order)) {
            var tabItem = document.getElementById('uib-st-tab-' + selectedTab.order);
            var menuItem = document.getElementById('uib-more-tab-' + selectedTab.order);

            if (!menuItem.className.includes("hide-item")) { //If menu item is present in the dropdown and is the selectedTab
                menuItem.children[0].classList.add("tick-mark");
                menuItem.parentElement.setAttribute('aria-activedescendant', menuItem.id);
                menuItem.children[0].setAttribute('aria-selected', true);
                addSelected(menuItem); //Added for accessibilty
            }
            setTimeout(function() {
                if (isSelectedTabNotPrimary)
                    tabItem.children[0].click();
            }, 0);
        }
        $scope.showOrHideMoreButton(moreItems);
    }

    // adapt on load
    $timeout(function() {
        doAdapt();
        c.more_title = "${Standard_ticket_more_menu}";
    }, 0);

    $window.addEventListener('load', function() {
        // handle load event
        doAdapt();
        c.more_title = "${Standard_ticket_more_menu}";
    });

    var prevTab;

    function renameMoreTab(tabSelected) {
        var moreBtn = document.getElementById("more-btn");
        var selectedItem;
        if (tabSelected)
            selectedItem = document.getElementById('uib-more-tab-' + tabSelected.order);
        var menuItemHidden;
        if (tabSelected && selectedItem)
            menuItemHidden = selectedItem.className.includes("hide-item");
        if (moreBtn && tabSelected && !menuItemHidden) {
            moreBtn.removeAttribute('tabindex'); //As menuitem is selected, now dropdown should appear in tabbing sequence
            c.more_title = tabSelected.name;
            if (!moreBtn.className.includes('active-dropdown'))
                moreBtn.className += ' active-dropdown';
        } else if (moreBtn && tabSelected && menuItemHidden) {
            c.more_title = "${Standard_ticket_more_menu}";
            $("#more-btn").removeClass("active-dropdown");
            moreBtn.setAttribute('tabindex', '-1'); //Reset tabindex -1
        }
    }
    window.addEventListener('resize', function() {
        $timeout(function() {
            doAdapt();
            renameMoreTab($scope.selectedTab);
        });
        if (prevTab && prevTab.childNodes[1])
            prevTab.removeChild(prevTab.childNodes[1]);
    }) // adapt on window resize

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
        prevTab = document.getElementById('uib-more-tab-' + tab.order).children[0];
        $scope.selectedTab = tab;
        renameMoreTab($scope.selectedTab);
        doAdapt(true);
        var moreBtn = document.getElementById("more-btn");
        moreBtn.removeAttribute('tabindex'); //As menuitem is selected, now dropdown should appear in tabbing sequence
        if (moreBtn)
            moreBtn.focus();
    }

    function loadWidget(currTab) {
        if (currTab && currTab.widget) return;
        $scope.server.get({
            action: 'load_widget',
            tab: currTab
        }).then(function(res) {
            if (res && res.data)
                currTab.widget = res.data.tabWidget;
            else
                $log.error($scope.data.widgetLoadingFailedMsg);
        });
    }

    $scope.onTabClick = function(tab) {
        renameMoreTab(tab);
        loadWidget(tab);
        doOperationOnPrevTab(prevTab);
        var selectedItem = document.getElementById('uib-more-tab-' + tab.order);
        if (selectedItem)
            prevTab = selectedItem.children[0];
        $scope.selectedTab = tab;
        doAdapt();
        $scope.$emit('sp.components.resize');
        var moreDropdown = document.getElementById("moreDropdown");
        if (moreDropdown) {
            $('#moreDropdown').tooltip('hide');
            if (moreDropdown.className.includes("open"))
                moreDropdown.classList.remove('open');
        }
    };

    //preload remaining tabs
    $timeout(function() {
        const remainingTabs = $scope.data.tabs.filter((t, index) => index !== 0 && !t.widget);
        function preloadTabs(deadline) {
            while ((deadline.timeRemaining() > 0 || deadline.didTimeout) && remainingTabs.length > 0) {
                const tab = remainingTabs.shift();
                loadWidget(tab);
            }
            if (remainingTabs.length > 0) {
                idleCallback(preloadTabs);
            }
        }
        // Polyfill fallback
        const idleCallback = window.requestIdleCallback || function(cb) {
            return setTimeout(() => {
                const start = Date.now();
                cb({
                    didTimeout: false,
                    timeRemaining: () => Math.max(0, 50 - (Date.now() - start))
                });
            }, 1);
        };
        idleCallback(preloadTabs);
    });



    $scope.showOrHideMoreButton = function(moreItems) {
        c.showMore = false;
        //hide dropdown if no elements are present
        Object.keys(moreItems).forEach(function(item) {
            if (!moreItems[item].className.includes("hide-item"))
                c.showMore = true;
        });
    }

    $scope.$on('dialog.upload_too_large.show', function(e) {
        $log.error($scope.data.largeAttachmentMsg);
        spUtil.addErrorMessage($scope.data.largeAttachmentMsg);
    });
}
