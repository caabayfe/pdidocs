(function() {
    let limit = 10;
    data.portal = $sp.getPortalRecord().getValue('sys_id');
    data.filtersAvailable = false;

    let notificationsUtil = new sn_ex_sp_notifs.PortalNotificationsUtil(data.portal);
    data.TABLE_NOTIFICATION_CONTENT = sn_ex_sp_notifs.PortalNotificationConstants.TABLE_NOTIFICATION_CONTENT;
    var notificationsConfig = notificationsUtil.getWidgetConfig();
    data.enableFilters = notificationsConfig.enable_filters;
    data.enableGlobalActions = notificationsConfig.enable_global_actions;

    data.enableNotificationHeader = data.enableFilters || data.enableGlobalActions;
    data.isRTL = notificationsUtil.isRTLLanguage();

    data.showMarkAllAsRead = input.show_mark_all_as_read;
    data.classiferFilterIds = input.classifier_ids;
    data.portal_notification_config_id = input.portal_notification_config_id;

    data.staticFilters = input.static_filters;
    data.dynamicFilters = notificationsUtil.getFilters(data.classiferFilterIds, data.portal_notification_config_id);
    if ((data.staticFilters && data.staticFilters.length > 0) || (data.dynamicFilters && data.dynamicFilters.length > 0))
        data.filtersAvailable = true;
    data.actions = input.actions;

    let staticFiltersLength = data.staticFilters ? data.staticFilters.length : 0;
    let dynamicFiltersLength = data.dynamicFilters ? data.dynamicFilters.length : 0;
    if (data.filtersAvailable)
        data.lastFilterElement = dynamicFiltersLength > 0 ? data.dynamicFilters[dynamicFiltersLength - 1] : data.staticFilters[staticFiltersLength - 1];

    if (input?.action == 'initialLoad') {
        data.viewUnreadNotifications = input.viewUnreadNotifications;
        data.actions = input.actions;
        let notificationsFetchStartTime = new GlideDateTime();
        data.firstLoadTime = notificationsFetchStartTime.getValue();
        data.filterQuery = input.filterQuery;

        data.notificationsData = notificationsUtil.getNotifications(
            notificationsFetchStartTime,
            limit,
            data.offset,
            data.viewUnreadNotifications,
            data.filterQuery
        );
        data.offset = limit;
        data.userNotifications = getNotificationCardData(data.notificationsData, data.actions);
        data.notificationWatcherFilter = "active=true^user=" + gs.getUserID() + "^portalsLIKE" + data.portal + '^sys_created_on>' + data.firstLoadTime;
        if (!gs.nil(data.filterQuery))
            data.notificationWatcherFilter = data.notificationWatcherFilter + '^' + data.filterQuery;
    }


    if (input?.action == 'loadMoreNotifications') {
        if (input.stopLoading)
            return;

        try {
            let notificationsFetchStartTime = new GlideDateTime(input.firstLoadTime);
            data.viewUnreadNotifications = input.viewUnreadNotifications;
            data.filterQuery = input.filterQuery;


            data.notificationsData = notificationsUtil.getNotifications(
                notificationsFetchStartTime,
                limit,
                input.offset,
                data.viewUnreadNotifications,
                data.filterQuery

            );

            if (data.notificationsData?.length > 0) {
                data.userNotifications = [...input.userNotifications, ...getNotificationCardData(data.notificationsData, data.actions)];
                data.stopLoading = false;
                data.offset = input.offset + limit;
            } else {
                data.userNotifications = input.userNotifications;
                data.stopLoading = true;
                data.offset = input.offset;
            }
        } catch (e) {
            gs.error('Error fetching notifications: ' + e.message);
        }
    }

    if (input?.action == 'markAllAsRead') {
        notificationsUtil.markAllAsRead();
    }

    /**
     * Function to structure the data for the notifications card widget
     * @param {Array} dataResults - Array of notification records fetched from getNotifications API
     * @returns {Array} Array of structured data for notification card widget
     * @see ec-notification-card widget
     * @see sn_ex_sp_notifs.PortalNotificationsUtil#getNotifications
     */
    function getNotificationCardData(dataResults, actions) {
        let dataPayload = [];
        dataResults.forEach(function(item) {
            let itemPayload = {};
            let widgetName = 'ec-notification-card';
            itemPayload.description = item.description;
            itemPayload.state = item.state;
            itemPayload.isActive = true;
            itemPayload.icon = item.icon;
            itemPayload.invertIconColor = item.invertIconColor;
            itemPayload.isCustomIcon = item.isCustomIcon;
            itemPayload.iconBackground = item.iconBackground;
            itemPayload.createdOn = item.createdOn;
            itemPayload.url = item.url;
            itemPayload.sysId = item.sysId;
            itemPayload.isCritical = item.isCritical;
            itemPayload.isReminder = item.isReminder;
            itemPayload.actions = actions;
            itemPayload.viewUnreadNotifications = data.viewUnreadNotifications;
            itemPayload.widgetData = $sp.getWidget(widgetName, itemPayload);
            dataPayload.push(itemPayload.widgetData);
        });
        return dataPayload;
    }


})();
