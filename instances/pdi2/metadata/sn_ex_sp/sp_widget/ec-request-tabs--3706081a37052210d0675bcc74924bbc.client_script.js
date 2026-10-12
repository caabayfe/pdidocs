api.controller = function($scope, $element, $timeout, $location, $rootScope) {
    var c = this;
    c.tabs = c.data.tabs;
    c.data.visibleTabs = [];
    c.data.overflowTabs = [];
    c.activeTab = null;
    c.isDropdownOpen = false;
    $scope.isLoading = true;
    $scope.isTabSwitching = true;
    var urlTabId = $location.search().tab_id || c.data.activeTabId;

    c.init = function() {
        // Check for tab ID in URL or use data.activeTabId
        var tabId = urlTabId || c.data.activeTabId;

        if (c.tabs.length) {
            // Find tab by ID
            for (var j = 0; j < c.tabs.length; j++) {
                if (c.tabs[j].sys_id == tabId) {
                    c.activeTab = c.tabs[j];
                    break;
                }
            }
        }


        if ((c.data.draftSearchText || c.data.activeTabId == "-1") && c.data.showDraftsTab) {
            $scope.searchText = c.data.draftSearchText;
            for (var i = 0; i < c.tabs.length; i++) {
                if (c.tabs[i].sys_id == c.data.draftTab.sys_id) {
                    c.activeTab = c.tabs[i];
                    break;
                }
            }
            $location.search('tab_id', '-1');
        }

        if (!c.activeTab) {
            c.activeTab = c.tabs[0];
            c.data.activeTabId = c.tabs[0].sys_id;
        }

        $timeout(function() {
            c.recalculateTabs();
        }, 100);

        var recalcTabsDebounced = _.debounce(function() {
            c.recalculateTabs();
        }, 200);

        angular.element(window).bind('resize', recalcTabsDebounced);

        // Store for cleanup
        c._recalcTabsDebounced = recalcTabsDebounced;
        $scope.isLoading = false;
        $scope.isTabSwitching = false;
    };

    c.selectTab = function(tab) {
        // Prevent unnecessary tab switching
        if (urlTabId === tab.sys_id) {
            return;
        }

        if (tab.sys_id != -1) {
            $scope.searchText = "";
            c.data.draftSearchText = "";
            $location.search('draftSearchText', null);
        }

        $location.search('tab_id', tab.sys_id);
    };

    $scope.$on("sn_ex_sp.applyRequestSearch", function(event, filterData, searchQuery) {
        c.data.searchParam = searchQuery;
        $scope.isLoading = true;
        c.server.get({
            action: 'fetchTabData',
            tabId: c.activeTab.sys_id,
            uiFilters: c.data.uiFilters,
            limit: c.data.limit,
            searchParam: c.data.searchParam
        }).then(function(resp) {
            $timeout(function() {
                c.data.requestContent = resp.data.requestContent;
                $scope.isLoading = false;
            }, 100);
        });
    });

    c.selectFromDropdown = function(tab) {
        c.isDropdownOpen = false;

        if (c.data.visibleTabIds.indexOf(tab.sys_id) !== -1) {
            c.activeTab = tab;
            c.updateTabVisibility();
            return;
        }

        // Update visible tabs
        c.data.visibleTabIds.pop();
        c.data.visibleTabIds.push(tab.sys_id);
        c.data.overflowTabs = [];
        for (var i = 0; i < c.tabs.length; i++) {
            if (c.data.visibleTabIds.indexOf(c.tabs[i].sys_id) === -1) {
                c.data.overflowTabs.push(c.tabs[i]);
            }
        }

        c.activeTab = tab;
        c.updateTabVisibility();
        c.selectTab(tab);
    };
    c.updateTabVisibility = function() {
        var allTabs = $element[0].querySelectorAll('.nav-tab');
        for (var i = 0; i < allTabs.length; i++) {
            var tabEl = allTabs[i];
            var tabId = tabEl.getAttribute('data-tab');
            if (c.data.visibleTabIds.indexOf(tabId) !== -1) {
                tabEl.classList.remove('hidden');
            } else {
                tabEl.classList.add('hidden');
            }
        }
        $rootScope.$emit('ec_request_tabs.loading_complete');
    };
    c.recalculateTabs = function() {
        $timeout(function() {
            var fitCount = c.calculateFittingTabs();
            c.data.fitCount = fitCount;
            var activeTabId = c.activeTab ? c.activeTab.sys_id : "";
            c.data.visibleTabIds = [];
            for (var i = 0; i < fitCount; i++) {
                c.data.visibleTabIds.push(c.tabs[i].sys_id);
            }
            if (activeTabId && c.data.visibleTabIds.indexOf(activeTabId) === -1) {
                c.data.visibleTabIds.pop();
                c.data.visibleTabIds.push(activeTabId);
            }
            c.data.overflowTabs = [];
            for (var j = 0; j < c.tabs.length; j++) {
                if (c.data.visibleTabIds.indexOf(c.tabs[j].sys_id) === -1) {
                    c.data.overflowTabs.push(c.tabs[j]);
                }
            }
            c.updateTabVisibility();
        });
    };

    c.calculateFittingTabs = function() {
        var container = $element[0].querySelector('[ng-ref="tabWrapper"]');
        if (!container) return 0;
        var availableWidth = container.offsetWidth - 8;
        var moreWidth = 80;
        var usedWidth = 0;
        var fitCount = 0;
        var tabsEle = $element[0].querySelectorAll('.nav-tab');
        for (var i = 0; i < tabsEle.length; i++) {
            var tab = tabsEle[i];
            tab.classList.remove('hidden');
            tab.classList.add('visible');
            var tabWidth = tab.getBoundingClientRect().width;
            if (usedWidth + tabWidth + moreWidth <= availableWidth) {
                usedWidth += tabWidth;
                fitCount++;
                tab.classList.add('hidden');
                tab.classList.remove('visible');
            } else {
                tab.classList.add('hidden');
                tab.classList.remove('visible');
                break;
            }
        }
        return fitCount;
    };

    $scope.$on('$destroy', function() {
        angular.element(window).unbind('resize', c._recalcTabsDebounced);
    });

    $scope.$on("sn_ex_sp.applyRequestFilters", function(event, filterData) {
        $scope.isLoading = true;
        c.data.uiFilters = getUiFilters(filterData);
        c.server.get({
            action: 'fetchTabData',
            tabId: c.activeTab.sys_id,
            definitionId: c.data.definitionId,
            uiFilters: c.data.uiFilters,
            limit: c.data.limit,
            searchParam: c.data.searchParam
        }).then(function(resp) {
            $timeout(function() {
                c.data.requestContent = resp.data.requestContent;
                $scope.isLoading = false;
            }, 100);
        });
    });

    $scope.$on("sn_ex_sp.RequestFiltersCleared", function(event, filterData) {
        c.data.uiFilters = {};
    });

    function getUiFilters(filterData) {
        var uiFilters = {};
        for (var i = 0; i < filterData.length; i++) {
            var item = filterData[i];
            var categoryId = item.categoryId;
            var filterType = item.filterType;
            var selectedFilters = item.selectedFilters;
            var tempFilters = [];
            for (var j = 0; j < selectedFilters.length; j++) {
                tempFilters.push(selectedFilters[j].value);
            }
            if (tempFilters.length > 0) {
                uiFilters[categoryId] = {};
                uiFilters[categoryId].filterType = filterType;
                uiFilters[categoryId].selectedOptions = tempFilters;
            }
        }
        return uiFilters;
    }

    c.toggleDropdown = function() {
        c.isDropdownOpen = !c.isDropdownOpen;
    };
};
