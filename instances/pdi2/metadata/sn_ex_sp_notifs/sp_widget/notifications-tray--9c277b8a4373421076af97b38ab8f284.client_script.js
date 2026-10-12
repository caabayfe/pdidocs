api.controller = function($scope, $timeout, snRecordWatcher) {
    /* widget controller */
    var c = this;
    $scope.timeout = $timeout;
    $scope.showFilters = false;
    $scope.viewUnreadNotifications = false;
    $scope.isLoadingInitial = true;
    $scope.isLoadingMore = false;
    $scope.stopLoading = false;
    $scope.showUtilitiesDropdown = false;
    $scope.showNewNotificationBadge = false;
    $scope.notificationFilter = '';
    $scope.isFilterSelected = false;
    $scope.appliedFilter = '';

    c.isRTL = c.data.isRTL;

    c.handleResize = function () {
        var navbarContainer = document.getElementById('ec-header-container');
        var navbarContainerWidth = (navbarContainer && navbarContainer.clientWidth) || 0;
        if (navbarContainerWidth === 0) return;

        var panelElement = angular.element('.notifications-panel');
        var panelRect = panelElement.get(0) && panelElement.get(0).getBoundingClientRect();
        var bellRect = angular.element('.btn-bell').get(0) && angular.element('.btn-bell').get(0).getBoundingClientRect();

        if (!panelRect || !bellRect) return;

        var rightPlacement = navbarContainerWidth - bellRect.right;
        var maxPanelWidth = 375;
        var minPanelWidth = 310;
        var finalPanelWidth = (navbarContainerWidth > maxPanelWidth) ? maxPanelWidth : navbarContainerWidth;
        var finalPanelMinWidth = (navbarContainerWidth > minPanelWidth) ? minPanelWidth : navbarContainerWidth;

        if (!c.isRTL) { // LTR Mobile view tray positioning
         if (bellRect.right < panelRect.width) {
            panelElement.css({
              right: '-' + rightPlacement + 'px',
              width: finalPanelWidth + 'px',
              minWidth: finalPanelMinWidth + 'px'
            });
          } else {
            panelElement.css({
              right: '0',
              minWidth: minPanelWidth + 'px'
            });
          }
        }  else {
            if (panelRect.width + bellRect.left > window.innerWidth) {
                angular.element(".notifications-panel").css('left', -bellRect.left);
            } else {
                angular.element(".notifications-panel").css('left', 0);
            }
        }

    };


    let getInitialNotifications = function() {
        $scope.isLoadingInitial = true;
        c.server.get({
            action: 'initialLoad',
            viewUnreadNotifications: $scope.viewUnreadNotifications,
            filterQuery: $scope.notificationFilter,
            actions: c.data.actions
        }).then(function(resp) {
            $timeout(function() {
                $scope.isLoadingInitial = false;
                $scope.showFilters = true;
                $scope.userNotifications = resp.data.userNotifications;
                c.data.firstLoadTime = resp.data.firstLoadTime;
                c.data.offset = resp.data.offset;
                var newNotifWatcher = snRecordWatcher.initList(c.data.TABLE_NOTIFICATION_CONTENT, resp.data.notificationWatcherFilter);
                c.data.newNotifWatcher = newNotifWatcher;
                newNotifWatcher.subscribe(function(response) {
                    $scope.showNewNotificationBadge = true;
                });
            }, 500);
        });
    };

    $scope.$on("NOTIFICATION_MARK_AS_READ", function(event, notificationSysId) {
        if ($scope.viewUnreadNotifications) {
            var index = $scope.userNotifications.findIndex((notification) => notification.options.sysId === notificationSysId);
            if (index !== -1) {
                $scope.userNotifications.splice(index, 1);
            }
        }
    });

    if ($scope.isLoadingInitial) {
        getInitialNotifications();
        c.handleResize();
    }

    c.loadLimit = _.range(10);

    c.openUtilitiesDropdown = function() {
        $scope.showUtilitiesDropdown = !$scope.showUtilitiesDropdown;
    };

    c.markAllAsRead = function() {
        c.server.get({
            action: 'markAllAsRead'
        }).then(function() {
            $scope.showUtilitiesDropdown = false;
            $scope.userNotifications.forEach((notification) => {
                notification.data.isUnread = false;
            });

            // If the view is toggled to show unread notifications, clear the notifications list
            // This ensures that the list is empty locally when all notifications are marked as read and reloaded on toggling

            if ($scope.viewUnreadNotifications) {
                $scope.userNotifications = [];
            }
        });
    };



    c.toggleUnreadNotifications = function() {
        $scope.viewUnreadNotifications = !$scope.viewUnreadNotifications;
        c.reloadNotifications();
    };

    c.setFilter = function(filter) {
        $scope.notificationFilter = filter.queryString;
        $scope.appliedFilter = filter.name;
        $scope.isFilterSelected = true;
        c.reloadNotifications();
    };
    c.removeFilter = function() {
        $scope.notificationFilter = '';
        $scope.appliedFilter = '';
        $scope.isFilterSelected = false;
        c.reloadNotifications();
        $timeout(function() {
            $(".btn-filter-by").focus();
        });
    }
    c.handleKeydownRemoveFilter = function() {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            event.stopPropagation();
            c.removeFilter();
        } else if (event.key == 'Tab' && !$scope.userNotifications.length) {
            $scope.$emit('CLOSE_NOTIFICATION_TRAY');
            $timeout(function() {
                $(".btn-bell").focus();
                $scope.$destroy();
            });
        }
    }

    c.reloadNotifications = function() {
        if (c.data.newNotifWatcher)
            c.data.newNotifWatcher.unsubscribe();
        $scope.showNewNotificationBadge = false;
        getInitialNotifications();
    };

    c.handleKeydownMarkAllAsRead = function($event) {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            event.stopPropagation();
            c.markAllAsRead();
        }
    };

    c.handleKeydownFilterItems = function($event, filter) {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            event.stopPropagation();
            c.setFilter(filter);
            $timeout(function() {
                $(".selection-remove").focus();
            });
        } else if (event.key == 'Tab' && filter.queryString == c.data.lastFilterElement.queryString && !$scope.userNotifications.length) {
            $scope.$emit('CLOSE_NOTIFICATION_TRAY');
            $scope.$destroy();
            $timeout(function() {
                $(".btn-bell").focus();
            });
        }
    };
};
