var AIExperienceNotificationUtilSNC = Class.create();
AIExperienceNotificationUtilSNC.prototype = {
    initialize: function(experienceId) {
        this.experienceId = experienceId;
        this.TABLE_NOTIFICATION_CONTENT = AIExperienceNotificationConstants.TABLE_NOTIFICATION_CONTENT;
        this.TABLE_NOTIFICATION_CONTENT_CONFIG = AIExperienceNotificationConstants.TABLE_NOTIFICATION_CONTENT_CONFIG;
        this.TABLE_SYS_NOTIFICATION = AIExperienceNotificationConstants.TABLE_SYS_NOTIFICATION;

        this.STATE_NEW = AIExperienceNotificationConstants.STATE_NEW; // new
        this.STATE_OPEN = AIExperienceNotificationConstants.STATE_OPEN; // opened
        this.STATE_VIEW = AIExperienceNotificationConstants.STATE_VIEW; // viewed

        this.ORDER_DEFAULT = AIExperienceNotificationConstants.ORDER_DEFAULT; // 100
    },

    _fetchIconData: function(notificationConfigGr) {
        let icon = {};
        let isCustom = notificationConfigGr.getValue("use_custom_icon") === '1';
        let customIcon = notificationConfigGr.getDisplayValue("custom_icon");
        icon.isCustomIcon = isCustom && customIcon.length > 0;
        icon.icon = isCustom ? customIcon : notificationConfigGr.getValue("icon");
        icon.iconBackground = notificationConfigGr.getValue("icon_background");

        return icon;
    },

    /**
     * Function to destructure notification data from a GlideRecord object
     * @param {GlideRecord} notificationGr - GlideRecord object for the notification content
     * @returns {Object} Object containing notification data
     * @see AIExperienceNotificationUtilSNC#getNotifications
     * @see AIExperienceNotificationUtilSNC#_getDescription
     * @see AIExperienceNotificationUtilSNC#_fetchIconData
     * @see AIExperienceNotificationConstants
     */
    _fetchNotificationData: function(notificationGr) {
        if (!notificationGr.isValidRecord()) {
            return;
        }
        let notificationData = {};
        let description = this._getDescription(notificationGr);
        if (gs.nil(description)) {
            return;
        }
        notificationData.description = description;
        notificationData.state = notificationGr.getValue('status');
        notificationData.createdOn = notificationGr.getValue('sys_created_on');
        notificationData.sysId = notificationGr.getUniqueValue();
        notificationData.url = notificationGr.getValue('action_url');
        notificationData.recordUpdateCount = ((notificationGr.getValue('notification_executions') || '').toString().split(",") || []).length;
        let iconData = this._fetchIconData(notificationGr.notification_content_config.getRefRecord());

        let notification = Object.assign(notificationData, iconData);
        return notification;
    },

    /**
     * Function to get the description of a notification
     * @param {GlideRecord} notificationsGr - GlideRecord object for the notification content
     * @returns {string} description of the notification
     */
    _getDescription: function(notificationsGr) {
        let template = notificationsGr.getValue("content_template");
        let parameters = notificationsGr.getValue("content_params");
        try {
            var params = JSON.parse(parameters);
        } catch (error) {
            gs.error('Unable to generate notification description: ' + error.message);
            return;
        }

        if (!Array.isArray(params) || !params.length) {
            return template;
        }

        let description = template.replace(/\{(\d+)\}/g, function(match, index) {
            return (index < params.length) ? params[index] : match;
        });
        return description;
    },

    /**
     * Function to get notifications of a user
     * @param {string} userID - ID of the user
     * @param {boolean} unreadOnly - get unread notifications instead of unseen
     * @param {number} windowStartTime - timestamp to filter records after it. If not given then fetches all records.
     * @param {number} windowSize - number of records to fetch. If not given then fetches all records.
     * @param {number} windowOffset - offset for pagination. If not given then fetches all records. Used with windowSize.
     * @param {string} filterQuery - filter query to apply on the notification records
     * @returns {array} array of notification objects
     */
    getNotifications: function(userID, windowStartTime, windowSize, windowOffset, unreadOnly, filterQuery) {
        userID = userID || gs.getUserID();
        windowOffset = windowOffset || 0;
        let notificationsGr = new GlideRecord(this.TABLE_NOTIFICATION_CONTENT);
        notificationsGr.addQuery("active", true);
        notificationsGr.addQuery("user", userID);
        notificationsGr.addQuery("experiences", this.experienceId);
        if (unreadOnly)
            notificationsGr.addQuery("status", '!=', this.STATE_OPEN);
        if (!gs.nil(filterQuery))
            notificationsGr.addEncodedQuery(filterQuery, true); // KB0559942
        notificationsGr.orderByDesc("order");
        notificationsGr.orderByDesc("sys_created_on");
        if (windowStartTime)
            notificationsGr.addQuery("sys_created_on", "<", windowStartTime);
        if (windowSize) {
            notificationsGr.chooseWindow(windowOffset, windowOffset + windowSize, false);
        }

        notificationsGr.query();

        let notifications = [];

        while (notificationsGr.next() && notificationsGr.canRead()) {
            let notificationItem = this._fetchNotificationData(notificationsGr);
            if (!gs.nil(notificationItem)) {
                notifications.push(notificationItem);
            }
            if (notificationsGr.getValue('status') == this.STATE_NEW) {
                notificationsGr.setValue('status', this.STATE_VIEW);
                notificationsGr.update();
            }
        }
        return notifications;
    },

    hasUnreadNotifications: function(userID) {
        userID = userID || gs.getUserID();
        let notificationsGr = new GlideRecordSecure(this.TABLE_NOTIFICATION_CONTENT);
        notificationsGr.addQuery("active", true);
        notificationsGr.addQuery("user", userID);
        notificationsGr.addQuery("experiences", this.experienceId);
        notificationsGr.addQuery("status", '!=', this.STATE_OPEN);
        notificationsGr.setLimit(1);
        notificationsGr.query();

        return notificationsGr.hasNext();
    },

    /**
     * Function to get the notification of new notificato=ion count
     * @returns {Number}
     */
    getNewNotificationCount(userId) {
        userId = userId || gs.getUserID();
        let notificationsAgg = new GlideAggregate(this.TABLE_NOTIFICATION_CONTENT);
        notificationsAgg.addQuery("active", true);
        notificationsAgg.addQuery("user", userId);
        notificationsAgg.addQuery("experiences", this.experienceId);
        notificationsAgg.addQuery("status", this.STATE_NEW);
        notificationsAgg.addAggregate("COUNT");
        notificationsAgg.query();

        if (!notificationsAgg.next())
            return 0;

        let count = parseInt(notificationsAgg.getAggregate("COUNT"), 10);
        return isNaN(count) ? 0 : count;
    },

    /**
     * Function to mark all notifications for a user as read
     * @returns {void}
     */
    markAllAsRead: function() {
        let notificationsGr = new GlideRecord(this.TABLE_NOTIFICATION_CONTENT);
        notificationsGr.addQuery("active", true);
        notificationsGr.addQuery("status", "!=", this.STATE_OPEN);
        notificationsGr.addQuery("experiences", this.experienceId);
        notificationsGr.addQuery("user", gs.getUserID());
        notificationsGr.query();
        notificationsGr.setValue("status", this.STATE_OPEN);

        try {
            notificationsGr.updateMultiple();
        } catch (error) {
            gs.error("Error bulk updating notification content: " + error.message);
            return null;
        }
    },

    /**
     * Function to mark given notifications for a user as read
     */
    markAsRead: function(notificationSysId) {
        let notificationsGr = new GlideRecordSecure(this.TABLE_NOTIFICATION_CONTENT);
        notificationsGr.addQuery("sys_id", notificationSysId);
        notificationsGr.addQuery("experiences", this.experienceId);
        notificationsGr.query();
        if (!notificationsGr.next()) {
            gs.warn("Notification not found: " + notificationSysId);
            return false;
        }
        notificationsGr.setValue("status", this.STATE_OPEN);
        var updateResult = notificationsGr.update();
        if (!updateResult) {
            gs.error("Failed to update notification: " + notificationSysId);
            return false;
        }

        return true;

    },

    type: 'AIExperienceNotificationUtilSNC'
};
