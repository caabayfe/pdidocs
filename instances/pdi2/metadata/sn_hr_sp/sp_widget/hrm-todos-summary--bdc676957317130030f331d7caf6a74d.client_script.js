function hrmTodosSummaryController($scope, $rootScope, $sanitize, spUtil, $window, $sce, $timeout, spAriaUtil, cabrillo, i18n) {
    var c = this;
    c.loaded = {};
    c.updateTab = {};
    c.loadingMore = {};
    c.todoDisplayed = {};
    c.defaultTodoDisplayed = {};
    c.selectedTodo = {};
    c.stopLoadMore = {};
    c.isMobileLeftPanelOpen = true;
    c.limit = c.data.queryLimit - 1;
    c.mobileDevice = c.data.isMobile || ($('.sp-page-root').width() <= 767);
    c.currentTab = c.data.tabs[0].name; // Sets default current Tab
    c.accessibility = spAriaUtil.isAccessibilityEnabled();
    c.currentPageTitle = $scope.page.title;
    c.filtersData = [];
    c.selectedFiltersFromTodoPage = [];
    c.navBarScrollable = false;

    // Used in the widget link function
    $scope.$timeout = $timeout;

    var todoDetailTitle = 'To-do detail';
    var resizeTime;
    var resizeTimeout = false;
    var delta = 500;
    if ($window.ResizeObserver) {
        var spPageroot = document.querySelector(".sp-page-root");
        var resizeObserver = new ResizeObserver(function() {
            resizeTime = new Date();
            if (resizeTimeout === false) {
                resizeTimeout = true;
                $timeout(isMobileDevice, delta);
            }

            handlePageTitleOnResize();
        });
        if (spPageroot)
            resizeObserver.observe(spPageroot);
    }

    function handlePageTitleOnResize() {
        if (isTodoDetail() && c.currentPageTitle !== todoDetailTitle) {
            setPageTitle(todoDetailTitle);
        } else if ($('.sp-page-root').width() > 767 && !c.data.onTicketPage && c.currentPageTitle == todoDetailTitle) {
            setPageTitle($scope.page.title);
        }
    }

    function isTodoDetail() {
        return $('.sp-page-root').width() <= 767 && !c.data.onTicketPage && !c.data.todoSummaryLeftPanel;
    }

    function isMobileDevice() {
        if (new Date() - resizeTime < delta) {
            $timeout(isMobileDevice, delta);
        } else {
            c.mobileDevice = c.data.isMobile || ($('.sp-page-root').width() <= 767);
            resizeTimeout = false;
        }
    }

    c.getDelegatedByText = function(delegatorName) {
        return $scope.data.i18n.DELEGATED_BY.replace('{}', delegatorName);
    };

    // instead  of adding more recordWatcher, listen to change from HRM To-Dos Task Item widget
    $scope.$on('updateDelegateRecord', function($event) {
        $event.stopPropagation();
        getMyTodos();
    });

    $scope.$on('sn_ex_sp.applyFilters', function($event, data) {
        $event.stopPropagation();
        c.data.action = "loadFilteredTodos";
        c.data.filtersData = data;
        c.loadingMore[c.data.defaultTab] = true;
        c.todoDisplayed[c.data.defaultTab] = [];
        c.server.update().then(function() {
            getMyTodos();
            c.loadingMore[c.data.defaultTab] = false;
            c.filtersData = c.data.filtersData;
            c.selectedFiltersFromTodoPage = c.data.selectedFiltersFromTodoPage;
        });
    });

    function announceTodoDisplayed(todo, isTabSwitch) {
        isTabSwitch = isTabSwitch || false;
        $rootScope.$broadcast('sn_hr_sp.todoDisplayed', todo, isTabSwitch);
    }

    // get the task-line-item widget template
    function loadTodoWidget(index, finalTodoList, tab) {
        finalTodoList[index].currentIndex = index;
        finalTodoList[index].totalTodos = finalTodoList.length;

        if (finalTodoList[index].taskConfigurationSysId && finalTodoList[index].taskConfigurationSysId !== '') {
            var taskObj = {
                taskSysId: finalTodoList[index].sysId,
                taskConfigurationSysId: finalTodoList[index].taskConfigurationSysId,
                Url: finalTodoList[index].url,
                widgetSpan: 9,
                tableName: finalTodoList[index].tableName,
                tabName: finalTodoList[index].tab
            };
            return spUtil.get("task-configuration", taskObj).then(function(response) {
                finalTodoList[index].todoLineWidget = response;
                if (c.data.todoParameter && c.defaultTodoDisplayed.recordsToShow && c.defaultTodoDisplayed.recordsToShow[tab] && c.defaultTodoDisplayed.recordsToShow[tab][index]) {
                    c.defaultTodoDisplayed.recordsToShow[tab][index].todoLineWidget = response;
                }

                createApprovalWatcher(taskObj.taskSysId, taskObj.tableName);

                $scope.$applyAsync(function() {
                    if (tab == c.currentTab)
                        announceTodoDisplayed(finalTodoList[index]);
                });
            });
        } else {
            return spUtil.get("hrm-todos-line-item", finalTodoList[index]).then(function(response) {
                finalTodoList[index].todoLineWidget = response;
                if (c.data.todoParameter && c.defaultTodoDisplayed.recordsToShow && c.defaultTodoDisplayed.recordsToShow[tab] && c.defaultTodoDisplayed.recordsToShow[tab][index]) {
                    c.defaultTodoDisplayed.recordsToShow[tab][index].todoLineWidget = response;
                }

                createAttachmentWatcher(response.data.sysId);
                createApprovalWatcher(response.data.sysId, response.data.tableName);

                $scope.$applyAsync(function() {
                    scope.handleTabIndexesAfterWidgetLoad();
                    if (tab == c.currentTab)
                        announceTodoDisplayed(finalTodoList[index]);
                });
            });
        }
    }



    function selectTodo(finalTodoList, tab) {
        // If array position exists, open to-do
        if (finalTodoList[c.selectedTodo[tab]]) {
            finalTodoList[c.selectedTodo[tab]].isOpen = true;
            // if there's no selected to-do, open the first one
        } else if (finalTodoList.length > 0 && !c.selectedTodo[tab]) {
            if (!(c.data.onTicketPage && c.data.hideTodoSummary)) {
                //If mobile view then reload the task list
                if (c.mobileDevice)
                    c.backToTaskList();
                finalTodoList[0].isOpen = true;
                c.selectedTodo[tab] = 0;
            }
            // If array position does not exist, and not the first one, select the last to-do
        } else if (!finalTodoList[c.selectedTodo[tab]] && c.selectedTodo[tab] > 0) {
            c.selectedTodo[tab] = _.findLastIndex(finalTodoList);
        }
    }

    c.trustAsHtml = function(htmlContent) {
        return $sce.trustAsHtml($sanitize(htmlContent));
    };

    function getLeftMenuItems(todosToShow, tab, loadMore) {
        var finalTodoList = _.map(todosToShow, function(todo) {
            todo.firstLoad = true;
            todo.isOpen = false; // Default
            return todo;
        });

        c.loaded[tab] = true;

        if (!loadMore) {
            selectTodo(finalTodoList, tab);
            if (!(c.data.onTicketPage && c.data.hideTodoSummary) && !c.data.todoParameter) {
                loadTodoWidget(c.selectedTodo[tab], finalTodoList, tab);
            }
        }

        return finalTodoList;
    }

    $scope.$on('sn_hr_sp.todoSummaryDetail', function(e, data) {
        if (data == null || data.parent != c.data.parentCaseId || !c.data.onTicketPage)
            return;
        c.data.hideTodoSummary = false;
        if (data.todoId != '')
            c.openTodo(data.todoId);
    });

    c.hasPreviousTodo = function() {
        return hasNextOrPreviousTodo(false);
    };

    c.hasNextTodo = function() {
        return hasNextOrPreviousTodo(true);
    };

    function hasNextOrPreviousTodo(next) {
        var todos, index, value;
        todos = c.todoDisplayed[c.currentTab];
        index = c.selectedTodo[c.currentTab];
        value = (next) ? index + 1 : index - 1;
        if (todos[value]) {
            return true;
        }
        return false;
    }

    function getPreviousOrNextTodo(next) {
        var todos, index, sysId, value;
        todos = c.todoDisplayed[c.currentTab];
        index = c.selectedTodo[c.currentTab];
        value = (next) ? index + 1 : index - 1;
        if (todos[value]) {
            sysId = todos[value].sysId;
        } else {
            sysId = todos[_.findLastIndex(todos)].sysId;
        }
        c.openTodo(sysId, c.currentTab);
    }

    c.getPreviousTodo = function() {
        if (c.hasPreviousTodo()) {
            return getPreviousOrNextTodo();
        }
    };

    c.getNextTodo = function() {
        return getPreviousOrNextTodo(true);
    };

    function find(sysId, tab) {
        return _.find(c.todoDisplayed[tab], {
            sysId: sysId
        });
    }

    function setOpenStatus(sysId, tab) {
        if (c.selectedTodo.hasOwnProperty(tab)) {
            c.todoDisplayed[tab][c.selectedTodo[tab]].isOpen = false;
        }
        var todo = find(sysId, tab);
        todo.isOpen = true;
        c.selectedTodo[tab] = _.findIndex(c.todoDisplayed[tab], {
            sysId: sysId
        });
    }

    function announceIsOpen(sysId, index) {
        $scope.$applyAsync(function() {
            $rootScope.$broadcast("sn_hr_sp.todoSummaryOpened", {
                parent: c.data.parentCaseId,
                todoSelected: sysId,
                currentTodoIndex: index
            });
        });
    }

    /**
     * Element el is considered in viewport when any part of the element is visible in the viewport.
     * Use offset to indicate how much of the element may be in view to consider the full element in view
     * ie. If we set offset = elem.offsetHeight then the element would be considered out of view unless
     * the entire element was visible in the view port.
     */
    function isElementInViewport(el, offset) {
        offset = offset || 0;
        var rect = el.getBoundingClientRect();
        var bottom = (window.innerHeight || document.documentElement.clientHeight) + el.offsetHeight - offset;
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= bottom &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }

    // checks if the element is completely visible within the container
    function isElementVisible(elem, container) {
        var elemRect = elem.getBoundingClientRect();
        var containerRect = container.getBoundingClientRect();
        return (
            elemRect.top >= containerRect.top &&
            elemRect.left >= containerRect.left &&
            elemRect.bottom <= containerRect.bottom &&
            elemRect.right <= containerRect.right
        );
    }

    c.openTodo = function(sysId, tab) {
        if (c.data.onTicketPage) { // Ticket page does not use tabs
            tab = c.data.defaultTab;
        }

        $rootScope.$broadcast('sp.update.breadcrumbs', [{
            label: c.data.txt.breadcrumb,
            url: "javascript:void(0)"
        }]);

        setOpenStatus(sysId, tab);
        var index = _.findIndex(c.todoDisplayed[tab], {
            sysId: sysId
        });
        c.todoDisplayed[tab][index].todoLineWidget = undefined;
        loadTodoWidget(index, c.todoDisplayed[tab], tab).then(function() {
            // scroll to the current todo if it is not completely visible in the todos list
            if (!c.mobileDevice) {
                $timeout(function() {
                    var selectedTodoElem = angular.element('#' + c.todoDisplayed[tab][index].sysId + '_task_lineitem_summary');
                    var scrollContainer = document.querySelector(".tab-content.clearfix");
                    if (typeof jQuery === "function" && selectedTodoElem instanceof jQuery) {
                        selectedTodoElem = selectedTodoElem[0];
                    }
                    if (selectedTodoElem) {
                        if (!isElementVisible(selectedTodoElem, scrollContainer)) {
                            scrollContainer.scrollBy(0, selectedTodoElem.getBoundingClientRect().top - scrollContainer.getBoundingClientRect().top);
                        }
                    }
                }, 0, false);
            }
        });

        c.data.todoSummaryLeftPanel = false;
        if (!c.data.onTicketPage && c.mobileDevice) {
            setPageTitle(todoDetailTitle);
        }

        if (c.data.onTicketPage) {
            announceIsOpen(sysId, index);
        }

        // See widget Link function
        $scope.handleTabIndexesAfterTodoOpened(sysId);
    };

    c.backToTaskList = function() {
        $rootScope.$broadcast("sn_hr_sp.backToTimeline");
    };

    c.openTodosSummaryList = function() {
        if (cabrillo.isNative())
            cabrillo.viewLayout.setBottomButtons();
        if (c.data.onTicketPage) {
            c.backToTaskList();
        } else {
            c.data.todoSummaryLeftPanel = true;
            setPageTitle($scope.page.title);
        }
    };

    c.onTabClick = function(tab) {
        if (c.currentTab != tab.name) {
            c.currentTab = tab.name;
            // If the tab's todos haven't been loaded yet, load them
            if (c.updateTab[tab.name] || !c.todoDisplayed[tab.name] || !c.todoDisplayed[tab.name].length)
                loadData(getMyTodos, tab);
            else {
                // Otherwise, if there was a previously selected todo on the tab, select it again
                var newTodoIndex = c.selectedTodo[c.currentTab];
                if (!c.mobileDevice) {
                    if (newTodoIndex != undefined && c.todoDisplayed[c.currentTab][newTodoIndex] && c.todoDisplayed[c.currentTab][newTodoIndex].sysId)
                        c.openTodo(c.todoDisplayed[c.currentTab][newTodoIndex].sysId, c.currentTab);
                    if (c.data.todosToShow && c.data.todosToShow.recordsToShow && c.data.todosToShow.recordsToShow[c.currentTab] && c.data.todosToShow.recordsToShow[c.currentTab][newTodoIndex])
                        announceTodoDisplayed(c.data.todosToShow.recordsToShow[c.currentTab][newTodoIndex], true);
                }
            }
        }
    };

    function setPageTitle(prefix) {
        c.currentPageTitle = prefix;
        $(document).prop('title', prefix + ' - ' + $scope.portal.title);
    }

    function loadData(callback, tab) {
        c.data.includeTodo = c.data.todoParameter;
        c.data.action = "loadTodos";
        if (c.existingTodoLength > 10) {
            c.data.limit = c.existingTodoLength;
        }
        if (tab) {
            c.data.tab = tab.name;
            c.loaded[tab.name] = false;
            c.defaultTodoDisplayed = JSON.parse(JSON.stringify(c.data.todosToShow));
            c.defaultRecordWatchers = c.data.todosToShow.recordWatchers;
        } else {
            c.data.tab = c.currentTab;
        }
        if (c.selectedFiltersFromTodoPage.applyFilters) {
            c.data.selectedFiltersFromTodoPage = c.selectedFiltersFromTodoPage;
        }
        c.server.update().then(function(response) {
            callback();
            if (tab) {
                c.defaultTodoDisplayed.recordsToShow[tab.name] = c.data.todosToShow.recordsToShow[tab.name];
                c.defaultTodoDisplayed.recordWatchers = c.defaultTodoDisplayed.recordWatchers.concat(c.data.todosToShow.recordWatchers);
                c.data.todosToShow = c.defaultTodoDisplayed;
                c.data.watchers = c.data.todosToShow.recordWatchers;
                c.todoDisplayed = c.data.todosToShow.recordsToShow;
                c.loaded[tab.name] = true;
                c.updateTab[tab.name] = false;
            }
            $timeout(function() {
                // See widget Link Function
                $scope.handleTabIndexesAfterLoad();
            });

            if (c.data.todoParameter && c.searchLinkedTodo) {
                if (c.todoDisplayed.completed && c.todoDisplayed.completed.length < 1)
                    loadData(getMyTodos, c.data.tabs[1]);

                c.searchLinkedTodo = false;
            }
        });
    }

    function hasChanged(w, dbEventDetails) {

        var tableName = w.data.table_name || w.table_name;
        var operation = w.data.operation || w.operation;
        var changes = w.data.changes || [];
        dbEventDetails = dbEventDetails || {};
        var currentTab = c.currentTab;
        var currentTodo = c.todoDisplayed[currentTab][c.selectedTodo[currentTab]].sysId;
        var changedTodo = w.data.sys_id;

        //prevent refresh if any other todo apart from current todo has been changed in the backend
        if (currentTodo !== changedTodo && tableName != 'sys_attachment')
            return false;

        //set the record watcher for all the fields other than comments and worknotes
        if (changes.length == 1 && ((_.includes(changes, 'comments')) || _.includes(changes, 'work_notes')))
            return false;
        if (changes.length == 2 && _.includes(changes, 'comments') && _.includes(changes, 'work_notes'))
            return false;
        if (changes.length == 1 && _.includes(changes, 'state') && dbEventDetails.isTaskSurvey)
            return false;
        if (operation === 'update' && changes.length === 0) // change in relationships
            return false;
        if (tableName === 'sys_attachment' && operation === 'update' && changes.length === 0) // change in relationships
            return false;
        if (tableName === 'sys_attachment' && operation === 'update' && changes[0] === 'file_name') // attachment renaming
            return false;
        if (tableName === 'sys_attachment' && changes.length <= 2 && _.includes(['state', 'image_width', 'image_height', 'average_image_color'], changes[0])) // img feature detection
            return false;
        return true;
    }

    c.lastInstanceNotified = null;

    //Check if Listening post is active , and the record state is either "Closed Complete" or "Closed Incomplete" 
    function _verifyNecessaryConditionForLPBroadcast(watcher) {
        return !!c.data.isLPActive && watcher.data.action === "exit" &&
            watcher.data.changes && watcher.data.changes.indexOf('state') != -1 &&
            watcher.data.record.state && (watcher.data.record.state.value == '3' || watcher.data.record.state.value == '4');
    }

    function _handleListeningPostBroadcast(watcher) {
        if (_verifyNecessaryConditionForLPBroadcast(watcher)) {
            // broadcast the sn_lp.task_completed event if the updated task have triggered conditions configured in Listening Posts
            c.server.get({
                action: "addNotification",
                taskId: watcher.data.sys_id,
                table: watcher.data.table_name
            }).then(function(response) {
                response.action = undefined;
                if (response.data.taskInfo && response.data.taskInfo.taskId && c.lastInstanceNotified !== response.data.taskInfo.taskId) {
                    c.lastInstanceNotified = response.data.taskInfo.taskId;
                    var taskInfo = {
                        taskId: response.data.taskInfo.taskId,
                        taskDescription: response.data.taskInfo.taskDescription
                    };
                    $rootScope.$broadcast("sn_lp.task_completed", taskInfo);
                }
            });
        }
    }

    function update(watcher) {
        _handleListeningPostBroadcast(watcher);
        _getDbEventDetails(watcher).then(function(dbEventDetails) {
            c.isTaskSurvey = dbEventDetails.isTaskSurvey;
            // cheap sync pre-filter just in case `watcher` has enough info to skip this iteration
            if (!hasChanged(watcher, dbEventDetails))
                return;

            // only the latest change triggers the actual refresh
            clearTimeout(update.timer);
            update.timer = setTimeout(function() {
                var isLocalChange = c.data.onTicketPage || watcher.data.table_name === 'sys_attachment' || watcher.table_name === 'sys_attachment';
                if (isLocalChange) {
                    _executeSidePanelUpdate(watcher);
                } else {
                    _executeFullPageUpdate(watcher);
                }
            }, 300);
        });
    }
    update.timer = null;
    update.surveys = {};

    function _getDbEventDetails(watcher) {

        var tableName = watcher.data.table_name;
        var sysId = watcher.data.sys_id;

        if (tableName === 'sys_attachment') {
            return Promise.resolve({
                isTaskSurvey: false
            });
        }

        if (update.surveys.hasOwnProperty(sysId)) {
            return Promise.resolve({
                isTaskSurvey: update.surveys[sysId]
            });
        }

        return c.server.get({
            action: "checkTaskType",
            sysId: sysId,
            table: tableName
        }).then(function(response) {
            response.action = undefined;
            update.surveys[sysId] = response.data.isTaskSurvey;
            return Promise.resolve({
                isTaskSurvey: response.data.isTaskSurvey
            });
        });

    }

    function _executeSidePanelUpdate(watcher) {

        var selectedIndex = c.selectedTodo[c.currentTab];
        var selectedTicket = c.todoDisplayed[c.currentTab][selectedIndex];
        commitToDom(function() {
            selectedTicket.isOpen = false;
        }).then(function() {
            c.openTodo(selectedTicket.sysId, c.currentTab);
        });
    }

    function _executeFullPageUpdate(watcher) {
        c.existingTodoLength = c.todoDisplayed[c.data.tab].length;
        $rootScope.$broadcast('sp.update.breadcrumbs', [{
            label: c.data.txt.breadcrumb,
            url: "javascript:void(0)"
        }]);
        _.each(c.loaded, function(value, key) {
            c.loaded[key] = false;
            c.updateTab[key] = false;
        });
        c.todoDisplayed = {};
        // If the last todo is approved, reset the selected todo to open first todo
        if (c.selectedTodo[c.data.tab] === c.existingTodoLength - 1) {
            c.selectedTodo = {};
        }
        loadData(function() {
            loadTodos();
        });
    }

    function createAttachmentWatcher(taskSysId) {
        if (createAttachmentWatcher.watchers[taskSysId]) return;
        createAttachmentWatcher.watchers[taskSysId] = true;
        spUtil.recordWatch(
            $scope,
            'sys_attachment',
            'table_sys_id=' + taskSysId,
            update
        );
    }
    createAttachmentWatcher.watchers = {};

    $rootScope.$on('list.updated', function(e, r) {
        // ignore sys_attachment to avoid unnecessary call to loadData
        if (r.table_name === 'sys_attachment' || c.data.onTicketPage)
            return;

        r.data = r;
        update(r);
    });

    $rootScope.$on('todosWatcherTriggered', function(event, watcherData) {
        updateRequired(watcherData);
    });

    function loadRecordWatchers(watchers, scope) {
        if (watchers.length > 0) {
            _.each(watchers, function(watcher) {
                spUtil.recordWatch(scope, watcher.table, watcher.filter, updateRequired);
            });
        }
    }

    function updateRequired(watcher) {
        _.each(c.data.tabs, function(tab) {
            c.updateTab[tab.name] = true;
        });
        update(watcher);
    }

    function loadWatchers() {
        if(!$rootScope.todosWatchersCreated){
            loadRecordWatchers(c.data.watchers, $scope);
        }
        if (c.mobileDevice && c.data.onTicketPage) {
            c.data.todoSummaryLeftPanel = false;
        }
    }

    function loadTodos() {
        _.each(c.data.todosToShow.recordsToShow, function(todos, tab) {
            c.todoDisplayed[tab] = getLeftMenuItems(todos, tab);
        });

        // Handle no results, and empty state
        _.each(c.data.tabs, function(tab) {
            if (!c.data.todosToShow.recordsToShow[tab.name] || (c.data.todosToShow.recordsToShow[tab.name] && c.data.todosToShow.recordsToShow[tab.name].length < 1) || !c.todoDisplayed[tab.name]) {
                c.todoDisplayed[tab.name] = [];
                c.loaded[tab.name] = true;
            } else if (c.todoDisplayed[tab.name].length > c.limit) // When the page is reloaded, show 'show more' button.
                c.stopLoadMore[tab.name] = false;
        });
    }

    function searchTodoInTab(todoSysId, tab) {
        var todosToSearch = c.todoDisplayed[tab];
        if (todosToSearch && todosToSearch.length > 0) {
            for (var i = 0; i < todosToSearch.length; i++)
                if (todosToSearch[i].sysId === todoSysId)
                    return true;
        }
        return false;
    }

    function openLinkedTodo(todoSysId) {
        if (todoSysId) {
            for (var tabIdx = 0; tabIdx < c.data.tabs.length; tabIdx++) {
                var tabName = c.data.tabs[tabIdx].name;
                if (searchTodoInTab(todoSysId, tabName)) {
                    c.currentTab = tabName;
                    c.openTodo(todoSysId, tabName);
                    return true;
                }
            }
            return false;
        }
        return false;
    }

    function getMyTodos() {
        loadWatchers();
        loadTodos();

        if (c.data.todoParameter && !c.searchLinkedTodo) {
            if (!openLinkedTodo(c.data.todoParameter)) {
                c.searchLinkedTodo = true;
            }
        }
    }

    c.processGetMoreTodos = function(tab) {
        var todosToShow = c.data.todosToShow.recordsToShow[tab];
        if (!todosToShow)
            c.stopLoadMore[tab] = true;
        var todoList = getLeftMenuItems(todosToShow, tab, true);
        c.todoDisplayed[tab] = c.todoDisplayed[tab].concat(todoList);

        // See widget Link Function for focusAfterLoadMore
        if (todoList && todoList.length > 0)
            scope.focusAfterLoadMore(todoList[0].sysId + '_task_lineitem_summary');
        else
            scope.focusAfterLoadMore();
    };

    c.fetchMoreRecords = function(tab) {
        c.loadingMore[tab] = true;
        c.data.action = "loadMoreTodos";
        c.data.excludeList = _.map(c.todoDisplayed[tab], 'sysId');
        c.data.selectedFiltersFromTodoPage = c.selectedFiltersFromTodoPage;
        c.server.update().then(function() {
            c.processGetMoreTodos(tab);
            c.loadingMore[tab] = false;
        });
    };

    function commitToDom(taskFn) {
        return new Promise(function(resolve) {
            // execute the change
            taskFn();
            $timeout(function() {
                // wait 1 tick, then run a digest, then resolve, then run another digest
                $timeout(resolve);
            });
        });
    }

    // start of the server call.
    if (c.data.async && !c.data.onTicketPage) {
        loadData(getMyTodos);
    } else {
        getMyTodos();
    }

    /**  Making tabs accessible **/

    $scope.$applyAsync(function() {
        new Tab("todo-panel");
    });

    function Tab(id) {
        this._id = id;
        this.$tpanel = $('#' + id);
        this.$tabs = this.$tpanel.find('.tab');
        this.$panels = this.$tpanel.find('.tab-pane');
        this.$navTabs = this.$tpanel.find('.nav.nav-tabs');
        this.bindHandlers();
        this.init();
    }

    createApprovalWatcher.watchers = {};

    function createApprovalWatcher(sysId, tableName) {
        if (!tableName) {
            tableName = 'sysapproval_approver';
        }
        if (createApprovalWatcher.watchers[sysId]) return;
        createApprovalWatcher.watchers[sysId] = true;
        spUtil.recordWatch(
            $scope,
            tableName,
            'sys_id=' + sysId,
            update
        );
    }

    Tab.prototype.keys = {
        left: 37,
        right: 39
    };
    Tab.prototype.init = function() {
        if (this.$navTabs && this.$navTabs[0] && (this.$navTabs[0].clientWidth < this.$navTabs[0].scrollWidth)) {
            c.navBarScrollable = true;
        }
        var $tab = this.$tabs.filter('.active');
        this.$tpanel.find('#' + $tab.find('a').attr('aria-controls')).addClass('active in').attr('aria-hidden', 'false');
    };
    Tab.prototype.switchTabs = function($curTab, $newTab) {
        if ($curTab[0] === $newTab[0])
            return;

        var $curLink = $curTab.find('a'),
            $newLink = $newTab.find('a');

        $newTab.addClass('active');
        $newLink.attr('aria-selected', 'true');
        this.$tpanel.find('#' + $curLink.attr('aria-controls')).removeClass('active in').attr('aria-hidden', 'true');
        this.$tpanel.find('#' + $curLink.attr('aria-controls') + "-content").removeClass('active in').attr('aria-hidden', 'true');
        this.$tpanel.find('#' + $newLink.attr('aria-controls')).addClass('active in').attr('aria-hidden', 'false');
        this.$tpanel.find('#' + $newLink.attr('aria-controls') + "-content").addClass('active in').attr('aria-hidden', 'false');
        $newLink.attr('tabindex', '0');
        $newLink.focus();
    };
    Tab.prototype.bindHandlers = function() {
        var self = this;
        this.$tabs.keydown(function(e) {
            return self.handleTabKeyDown($(this), e);
        });
        this.$tabs.click(function(e) {
            return self.handleTabClick($(this), e);
        });
    };
    Tab.prototype.moveToPreviousOrNext = function(e, $tab, next) {
        var $newTab, tabIndex;
        tabIndex = this.$tabs.index($tab);
        var index = (next) ? this.$tabs.length - 1 : 0;
        if (tabIndex === index) {
            $newTab = (next) ? this.$tabs.first() : this.$tabs.last();
        } else {
            var newIndex = (next) ? tabIndex + 1 : tabIndex - 1;
            $newTab = this.$tabs.eq(newIndex);
        }
        this.switchTabs($tab, $newTab);
        var $newLink = $newTab.find('a');
        var newTabName = $newLink.attr('aria-controls');
        var tabObj = c.data.tabs.find(function(t) {
            return t.name === newTabName;
        });
        if (tabObj) {
            // Call "onTabClick" to load the tab contents (if needed)
            c.onTabClick(tabObj);
        }
        e.preventDefault();
        return false;
    };
    Tab.prototype.handleTabKeyDown = function($tab, e) {
        $tab.click();
        if (e.keyCode == this.keys.left) {
            this.moveToPreviousOrNext(e, $tab);
        } else if (e.keyCode == this.keys.right) {
            this.moveToPreviousOrNext(e, $tab, true);
        }
    };
    Tab.prototype.handleTabClick = function($tab, e) {
        var $oldTab = this.$tpanel.find('.tab.active');
        this.switchTabs($oldTab, $tab);
    };
    /**  Making tabs accessible **/
    $scope.isSignPadVisible = false;
    $scope.$on('mobile-showSignPad', function(event, args) {
        $scope.isSignPadVisible = !$scope.isSignPadVisible;
    });

    $scope.showSignPad = function() {
        $rootScope.$broadcast('mobile-showSignPad');
    };

    $scope.backToListKeyDown = function(event) {
        if (event.keyCode == 13 || event.keyCode == 32)
            c.backToTaskList();
    };

    $scope.onListKeyDown = function(event) {
        if (event.keyCode != 40 && event.keyCode != 38) // Up or down keys
            return;

        event.stopPropagation();
        event.preventDefault();
        // See widget Link Function
        scope.handleListKeyNavigation(event);
    };

    $scope.$on('sn_hr_sp.summaryCountUpdate', function(event, data) {

        if (data.summaryCounts && data.summaryCounts.recordsToShow.length > 0) {

            c.data.todosToShow.recordsToShow.open = [];
            c.data.todosToShow.recordsToShow.open = data.summaryCounts.recordsToShow.map(function(record) {
                return Object.assign({}, {
                    sysId: record.summaryData.recordInfo.sys_id
                }, record.summaryData);
            });

            c.data.activitySetName = data.summaryCounts.activitySetName;
            c.data.activitySetAriaLabel = i18n.format(c.data.txt.backToAriaLabel, c.data.activitySetName);
            c.data.activitySetId = data.summaryCounts.activitySetId;
            c.data.hideTodoSummary = data.summaryCounts.hideTodoSummary;
            c.data.todosToShow.recordWatchers = data.summaryCounts.recordWatchers;
            c.data.watchers = c.data.todosToShow.recordWatchers || [];
            c.data.onTodoPage = false;
            c.data.onTicketPage = true;
            c.data.parentCaseId = data.summaryCounts.parent;
            c.data.selectedTodo = data.summaryCounts.todoSelected;
            c.data.currentTodoIndex = (c.data.todosToShow.recordsToShow[c.data.defaultTab] && c.data.todosToShow.recordsToShow[c.data.defaultTab].length > data.summaryCounts.currentTodoIndex) ? data.summaryCounts.currentTodoIndex : 0;

            //To initiate reading data again and make the UI
            loadTodos();
        } else {
            c.backToTaskList();
        }
        $rootScope.targetLength = data.summaryCounts.recordsToShow.length;
    });
}
