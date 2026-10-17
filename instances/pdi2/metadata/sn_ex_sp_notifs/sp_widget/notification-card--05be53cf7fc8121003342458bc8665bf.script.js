(function() {
    data.cardData = options;
    data.sysId = data.cardData.sysId;
    data.actions = data.cardData.actions;
    data.reminderActionName = sn_ex_sp_notifs.PortalNotificationConstants.REMINDERS;
    data.isUnread = sn_ex_sp_notifs.PortalNotificationConstants.STATE_OPEN != data.cardData.state;
    data.isCritical = data.cardData.isCritical;
    data.isReminder = data.cardData.isReminder;
    data.isNotificationActive = data.cardData.isActive;
    data.viewUnreadNotifications = data.cardData.viewUnreadNotifications;

    data.invertIconColor = data.cardData.invertIconColor;
    data.portal = $sp.getPortalRecord().getValue('sys_id');
    var notificationsUtil = new sn_ex_sp_notifs.PortalNotificationsUtil(data.portal);
    data.openInNewTab = notificationsUtil.getWidgetConfig().open_notification_in_new_tab;

    if (input?.action) {
        switch (input.action) {
            case sn_ex_sp_notifs.PortalNotificationConstants.CARD_ACTION_MARK_AS_READ: {
                if (input.isUnread)
                    notificationsUtil.updateReadStatus(input.sysId, true);
                break;
            }
            case sn_ex_sp_notifs.PortalNotificationConstants.CLEAR_NOTIFICATION:
            case sn_ex_sp_notifs.PortalNotificationConstants.UNDO_CLEAR_NOTIFICATION: {
                data.isNotificationActive = input.active_status;
                notificationsUtil.updateActiveStatus(input.sysId, input.active_status);
                break;
            }
            case sn_ex_sp_notifs.PortalNotificationConstants.CARD_ACTION_MARK_AS_UNREAD:
                notificationsUtil.updateReadStatus(input.sysId, false);
                break;
            case sn_ex_sp_notifs.PortalNotificationConstants.CARD_ACTION_REMIND_IN_30_MINS:
                notificationsUtil.scheduleReminder(input.sysId, 30, new Date().toISOString());
                break;
            case sn_ex_sp_notifs.PortalNotificationConstants.CARD_ACTION_REMIND_IN_60_MINS:
                notificationsUtil.scheduleReminder(input.sysId, 60, new Date().toISOString());
                break;
            case sn_ex_sp_notifs.PortalNotificationConstants.CARD_ACTION_REMIND_NEXT_WEEK: {
                const minutesInOneWeek = 7 * 24 * 60;
                notificationsUtil.scheduleReminder(input.sysId, minutesInOneWeek, new Date().toISOString());
                break;
            }
        }
    }
    data.moreEnabled = data?.actions?.length > 0;

})();
