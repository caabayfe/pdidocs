var EcNotificationHelperUtilSNC = Class.create();
EcNotificationHelperUtilSNC.prototype = {
    initialize: function() {},
    /**
     * Function to filter the sys_notification records which have a portal content associated to it
     * @returns {string} - comma based string of sys_notification sys_id's
     */
    filterPortalContent: function() {
        let notificationsSet = new Set();
        let notificationContentGr = new GlideRecordSecure('sn_ex_sp_notifs_portal_notification_content');
        notificationContentGr.addActiveQuery();
        notificationContentGr.query();
        while (notificationContentGr.next()) {
            notificationsSet.add(notificationContentGr.getValue('notification'));
        }

        let sysGr = new GlideRecordSecure('sys_notification');
        sysGr.addActiveQuery();
        sysGr.addQuery('sys_id', 'IN', [...notificationsSet]);
        sysGr.query();

        let uniqueSysIds = [];
        while (sysGr.next()) {
            uniqueSysIds.push(sysGr.getValue('sys_id'));
        }

        let finalList = uniqueSysIds.join(',');
        return finalList;
    },
    type: 'EcNotificationHelperUtilSNC'
};
