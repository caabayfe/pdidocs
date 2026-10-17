api.controller = function($scope, $location, $rootScope, spUtil, $timeout, i18n) {
    /* widget controller */
    var c = this;
    $scope.isNotificationsTrayOpen = false;
    $scope.notificationAriaLabel = "";

    $scope.$on("CLOSE_NOTIFICATION_TRAY", function(event) {
        c.toggleNotificationsTray('close');
    });

    // In NotificationController
    $scope.updateNotificationAriaLabel = function() {
        if (c.data.notificationConfig.enable_badge_count) {
            if (c.data.notificationsBadgeCount > 0) {
                $scope.notificationAriaLabel = c.data.notificationsBadgeCount > 9 ? i18n.getMessage('9+ new notifications') : i18n.getMessage("{0} new notifications").withValues([c.data.notificationsBadgeCount]);
            } else {
                $scope.notificationAriaLabel = i18n.getMessage('0 new notifications');
            }
        } else {
            if (c.data.notificationsBadgeCount > 0) {
                $scope.notificationAriaLabel = i18n.getMessage('New notifications');
            } else {
                $scope.notificationAriaLabel = i18n.getMessage('Notifications');
            }
        }
    };

    $scope.updateNotificationAriaLabel();

    $scope.$watch('c.data.notificationsBadgeCount', function(newVal, oldVal) {
        if (newVal !== oldVal) {
            $scope.updateNotificationAriaLabel();
        }
    });

    c.toggleNotificationsTray = function(action) {
        switch (c.data.displayMode) {
            case 'page_view':
                $location.search({id: c.data.notificationsPage});
                break;
            case 'tray_view':
                    if(action === 'open') 
                        $scope.isNotificationsTrayOpen = true;
                    else if(action === 'close') 
                        $scope.isNotificationsTrayOpen = false;
                    else if(!action) // fallback toggle for backward compatibility
                        $scope.isNotificationsTrayOpen = !$scope.isNotificationsTrayOpen;
                    const liveRegion = angular.element(".notification-button-toggle")[0];
                    if ($scope.isNotificationsTrayOpen) {
                        setTimeout(() => {
                            liveRegion.innerText = i18n.getMessage("Expanded");
                        }, 100);
        
                        spUtil.get("ec-notifications-tray", {
                            ...c.data.trayWidgetOptions
                        }).then(function(response) {
                            c.data.notificationsTrayWidget = response;
                        });
                    } else {
                        liveRegion.innerText = i18n.getMessage("Collapsed");
                    }
                break;
        }
    };

    $scope.refreshNotificationsCount = function(instanceOptions) {
        if (instanceOptions) {
            c.data.disable_notification_count = instanceOptions.disable_notification_count.value;
            c.data.view_unread_notification_count = instanceOptions.view_unread_notification_count.value;
        }
        c.server.get({
            action: 'refresh_notification_count',
            disable_notification_count: c.data.disable_notification_count,
            view_unread_notification_count: c.data.view_unread_notification_count,
            showMarkAllAsRead: c.data.showMarkAllAsRead
        }).then(function(resp) {
            c.data.notificationsBadgeCount = resp.data.notificationsBadgeCount;
            $rootScope.$broadcast('notificationCountUpdated', c.data.notificationsBadgeCount);
        });
    };

    c.processWatchers = function(instanceOptions) {
        // For notification count update
        if (!instanceOptions.portal_notification_config) {
            $timeout($scope.refreshNotificationsCount, 0);
        } else {
            // For toggling unread notifications
            $timeout(function() {
                $scope.refreshNotificationsCount(instanceOptions.portal_notification_config.value.badge);
            }, 0);
        }
    };
	
    /* Record Watcher */
    spUtil.recordWatch($scope, c.data.TABLE_NOTIFICATION_CONTENT, c.data.notificationWatcherFilter, c.processWatchers);

    angular.element('.notifications-tray').click(function() {
        return false;
    });

    c.escapeClose = function(event) {
        if (event.key === 'Escape' && $scope.isNotificationsTrayOpen) {
            c.toggleNotificationsTray('close');
        }
    };

};
