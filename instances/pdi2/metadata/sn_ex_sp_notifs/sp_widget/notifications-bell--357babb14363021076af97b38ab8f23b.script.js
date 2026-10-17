(function() {
    data.TABLE_NOTIFICATION_CONTENT = sn_ex_sp_notifs.PortalNotificationConstants.TABLE_NOTIFICATION_CONTENT;
    data.TABLE_SP_INSTANCE_MENU = PortalNotificationConstants.TABLE_SP_INSTANCE_MENU;
    data.ACTION_REFRESH_NOTIF_COUNT = 'refresh_notification_count';

    data.portal = $sp.getPortalRecord().getValue('sys_id');
    data.notificationsPage = "ec_notifications_page";
    var notificationsUtil = new sn_ex_sp_notifs.PortalNotificationsUtil(data.portal);
    data.notificationConfig = notificationsUtil.getWidgetConfig();
    data.displayMode = data.notificationConfig.display_mode;

    //Load Notifications count
    if ((!input || input.action == data.ACTION_REFRESH_NOTIF_COUNT)) {
        data.notificationsBadgeCount = notificationsUtil.getNotificationsCount(data.notificationConfig.show_unread_count);
        data.notificationWatcherFilter = "active=true^user=" + gs.getUserID() + "^portalsLIKE" + data.portal;
        data.instanceMenuFilter = "sys_id=493d01365368301056c1ddeeff7b1207";

        // avoid consecutive calls 
        if (input)
            return;
    }

    if (!data.notificationConfig.enable_badge_count) {
        data.badgeAriaLabel = gs.getMessage('New notifications');
    } else {
        let notificationCount = data.notificationsBadgeCount > 9 ? '9+' : data.notificationsBadgeCount;
        data.badgeAriaLabel = gs.getMessage('{0} new notifications', [notificationCount]);
    }

    if (data.displayMode !== 'page_view')
        data.trayWidgetOptions = notificationsUtil.getNotificationsTrayWidgetOptions();

})();
