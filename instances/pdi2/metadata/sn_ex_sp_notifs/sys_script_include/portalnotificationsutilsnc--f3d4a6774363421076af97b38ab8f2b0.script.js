var PortalNotificationsUtilSNC = Class.create();
PortalNotificationsUtilSNC.prototype = {
    /**
     * Constructor
     * @param {string} portalID - Sys ID of the portal 
     */
    initialize: function(portalID) {
        this.portalID = portalID;

        this.CACHE_NAME = sn_ex_sp_notifs.PortalNotificationConstants.PORTAL_NOTIFICATION_CACHE;
        this.PORTAL_CONFIG_CACHE_KEY = `${PortalNotificationConstants.PORTAL_CONFIG_CACHE_PREFIX}${portalID}`;
        this.PORTAL_FILTERS_CACHE_KEY = `${PortalNotificationConstants.PORTAL_FILTERS_CACHE_PREFIX}${portalID}`;

        this.TABLE_NOTIFICATION_CONTENT = sn_ex_sp_notifs.PortalNotificationConstants.TABLE_NOTIFICATION_CONTENT;
        this.TABLE_NOTIFICATION_CONFIG = sn_ex_sp_notifs.PortalNotificationConstants.TABLE_NOTIFICATION_CONFIG;
        this.TABLE_NOTIFICATION_CONTENT_CONFIG = sn_ex_sp_notifs.PortalNotificationConstants.TABLE_NOTIFICATION_CONTENT_CONFIG;
        this.TABLE_SYS_NOTIFICATION = sn_ex_sp_notifs.PortalNotificationConstants.TABLE_SYS_NOTIFICATION;
        this.TABLE_NOTIFICATION_CLASSIFICATION = sn_ex_sp_notifs.PortalNotificationConstants.TABLE_SYS_NOTIFICATION_CLASSIFICATION;

        this.STATE_NEW = sn_ex_sp_notifs.PortalNotificationConstants.STATE_NEW; // new
        this.STATE_OPEN = sn_ex_sp_notifs.PortalNotificationConstants.STATE_OPEN; // opened
        this.STATE_VIEW = sn_ex_sp_notifs.PortalNotificationConstants.STATE_VIEW; // viewed

        this.ORDER_DEFAULT = sn_ex_sp_notifs.PortalNotificationConstants.ORDER_DEFAULT; // 100
        this.ORDER_CRITICAL = sn_ex_sp_notifs.PortalNotificationConstants.ORDER_CRITICAL; // 200

        this.EVENT_CREATE_REMINDER = sn_ex_sp_notifs.PortalNotificationConstants.EVENT_CREATE_REMINDER;
    },

    /**
     * Function to check if the current language is an RTL (Right-to-Left) language
     * @returns {boolean} "rtl" if the current language is RTL, otherwise "ltr"
     */
    isRTLLanguage: function() {
        const rtlLanguages = sn_ex_sp_notifs.PortalNotificationConstants.RTL_LANGUAGES;
        const currentLanguage = gs.getSession().getLanguage(); 
        return (rtlLanguages.indexOf(currentLanguage) !== -1) ? true : false;
    },

    /**
     * Function to retrieve the notification widget config to drive the UX behavior
     * @returns {Object} Config object
     */
    getWidgetConfig: function() {
        try {
            const configString = sn_scoped_cache.ScopedCacheManager.get(this.CACHE_NAME, this.PORTAL_CONFIG_CACHE_KEY);
            if (configString)
                return JSON.parse(configString);
        } catch (e) {}

        let configGr = new GlideRecord(this.TABLE_NOTIFICATION_CONFIG);
        configGr.addActiveQuery();
        configGr.addQuery("portal", this.portalID);
        configGr.orderByDesc("order");
        configGr.query();

        if (configGr.next()) {
            const cardActions = (configGr.getValue("card_actions") || "").split(",");
            const trayActions = (configGr.getValue("tray_actions") || "").split(",");
            const staticFilterSelection = (configGr.getValue("static_filters") || "").split(",");
            let staticFilters = [];
            staticFilterSelection.forEach(filterID => {
                const matchingFilter = sn_ex_sp_notifs.PortalNotificationConstants.PORTAL_STATIC_FILTERS.filter(f => f.id == filterID);
                if (matchingFilter.length)
                    staticFilters.push(matchingFilter[0]);
            });

            const configData = {
                sys_id: configGr.getValue("sys_id"),
                enable_bell_icon: configGr.getValue("enable_bell_icon") === "1",
                enable_badge_count: configGr.getValue("enable_badge_count") === "1",
                show_unread_count: configGr.getValue("show_unread_count") === "1",
                ga_mark_all_as_read: trayActions.indexOf("mark_all_as_read") > -1,
                ca_mark_as_read: cardActions.indexOf("mark_as_read") > -1,
                ca_reminders: cardActions.indexOf("reminder") > -1,
                ca_clear_notification: cardActions.indexOf("clear") > -1,
                notification_classification_filters: configGr.getValue("notification_classification_filters") ? configGr.getValue("notification_classification_filters").split(",") : [],
                static_filters: staticFilters,
                display_mode: configGr.getValue("display_mode"),
                enable_filters: configGr.getValue("enable_filters") === "1",
                enable_global_actions: configGr.getValue("enable_global_actions") === "1",
                open_notification_in_new_tab: configGr.getValue("open_notification_in_new_tab") === "1"
            };
            sn_scoped_cache.ScopedCacheManager.put(this.CACHE_NAME, this.PORTAL_CONFIG_CACHE_KEY, JSON.stringify(configData));
            return configData;
        }

        return sn_ex_sp_notifs.PortalNotificationConstants.PORTAL_NOTIFICATION_DEFAULT_CONFIG;
    },

    /**
     * Function to retrieve the notification tray widget options
     * @returns {Object} Options object
     */
    getNotificationsTrayWidgetOptions: function() {
        return {
            "show_mark_all_as_read": this.getWidgetConfig().ga_mark_all_as_read,
            "portal_notification_config_id": this.getWidgetConfig().sys_id,
            "actions": this._getActions(),
            "classifier_ids": this.getWidgetConfig().notification_classification_filters,
            "static_filters": this.getWidgetConfig().static_filters
        };
    },

    /**
     * Function to get the actions for the notification tray widget
     * @returns {Array} Array of notification card action objects
     */
    _getActions: function() {
        const actions = sn_ex_sp_notifs.PortalNotificationConstants.CARD_ACTIONS;
        const actionNameMap = {
            ca_mark_as_read: sn_ex_sp_notifs.PortalNotificationConstants.CARD_ACTION_MARK_AS_READ,
            ca_reminders: sn_ex_sp_notifs.PortalNotificationConstants.REMINDERS,
            ca_clear_notification: sn_ex_sp_notifs.PortalNotificationConstants.CLEAR_NOTIFICATION,
        };
        let matchingActions, actionKey;
        let allCardActionsDisabled = true;
        for (actionKey in actionNameMap) {
            if (this.getWidgetConfig()[actionKey]) {
                allCardActionsDisabled = false;
                continue;
            }
            matchingActions = actions.filter(ac => ac.actionName == actionNameMap[actionKey]);
            if (matchingActions.length > 0)
                matchingActions[0].enabled = false;
        }
        return allCardActionsDisabled ? [] : this._flattenActions(actions);
    },
    
    /**
     * Function to flatten the actions array
     * @param {Array} actions - Array of action objects
     * @returns {Array} Flattened array of action objects
     */
    _flattenActions: function(actions) {
        return actions.reduce((actionArray, action) => {
            // adding label
            if (action.actionName) {
                actionArray.push({
                    ...action
                });
            } else {
                // nested actions
                actionArray.push({
                    label: action.label,
                    enabled: action.enabled
                });
            }
            // If there are nested actions, add those as well
            if (action.actions) {
                action.actions.forEach(nestedAction => {
                    actionArray.push({
                        ...nestedAction,
                        enabled: action.enabled ? true : false,
                        parentLabel: action.label // adding parent label for nested actions
                    });
                });
            }
            return actionArray;
        }, []);
    },

    /**
     * Function to get count of notifications based on viewUnread flag
     * @param {boolean} viewUnreadNotifications - get unread notifications instead of unseen
     * @param {string} userID - ID of the user
     * @returns {Integer} count of table records
     */
    getNotificationsCount: function(viewUnreadNotifications, userID) {
        userID = userID || gs.getUserID();
        let notificationCount = 0;

        let notificationsGA = new GlideAggregate(this.TABLE_NOTIFICATION_CONTENT);
        notificationsGA.addQuery("active", true);
        notificationsGA.addQuery("user", userID);
        notificationsGA.addQuery("portals", this.portalID);
        if (viewUnreadNotifications) {
            notificationsGA.addEncodedQuery('status!=opened');
        } else {
            notificationsGA.addEncodedQuery('status=new');
        }
        notificationsGA.addAggregate("COUNT");
        notificationsGA.query();

        if (notificationsGA.next()) {
            notificationCount = notificationsGA.getAggregate("COUNT");
        }

        return notificationCount;
    },

    /**
     * Function to get the description of a notification
     * @param {GlideRecord} notificationsGr - GlideRecord object for the notification content
     * @param {boolean} isCritical - indicates if the notification is critical
     * @returns {string} description of the notification
     */
    _getDescription: function(notificationsGr, isCritical, isReminder) {
        let template = notificationsGr.getValue("content_template");
        let parameters = notificationsGr.getValue("content_params");
        try {
            var params = JSON.parse(parameters);
        } catch (error) {
            gs.error('Unable to generate notification description: ' + error.message);
            return;
        }

        let description = gs.getMessage(template, params);
        if ((isCritical || isReminder) && !gs.nil(description)) {
            let msg = isCritical ? gs.getMessage('Critical Alert: {0}', [description]) : gs.getMessage('Reminder: {0}', [description]);
            return msg;
        }
        return description;
    },

    _fetchIconData: function(notificationConfigGr, isCritcal, isReminder) {
        let icon = {};
        let isCustom = notificationConfigGr.getValue("use_custom_icon") === '1';
        let customIcon = notificationConfigGr.getDisplayValue("custom_icon");
        icon.isCustomIcon = isCustom && customIcon.length > 0;
        icon.icon = isCustom ? customIcon : "fa-" + notificationConfigGr.getValue("icon");
        icon.iconBackground = notificationConfigGr.getValue("icon_background");
        icon.invertIconColor = notificationConfigGr.getValue("invert_icon_color") === '1';
        if (isCritcal || isReminder) {
            icon.isCustomIcon = false;
            if (isCritcal) {
                icon.icon = sn_ex_sp_notifs.PortalNotificationConstants.ICON_CRITICAL;
                icon.invertIconColor = true;
            } else {
                icon.iconBackground = "";
                icon.icon = sn_ex_sp_notifs.PortalNotificationConstants.ICON_REMINDER;
                icon.invertIconColor = false;
            }
        }
        return icon;
    },

    /**
     * Function to destructure notification data from a GlideRecord object
     * @param {GlideRecord} notificationGr - GlideRecord object for the notification content
     * @returns {Object} Object containing notification data
     * @see sn_ex_sp_notifs.PortalNotificationsUtil#getNotifications
     * @see sn_ex_sp_notifs.PortalNotificationsUtil#_getDescription
     * @see sn_ex_sp_notifs.PortalNotificationsUtil#_fetchIconData
     * @see sn_ex_sp_notifs.PortalNotificationConstants
     */
    _fetchNotificationData: function(notificationGr) {
        if (!notificationGr.isValidRecord()) {
            return;
        }
        let notificationData = {};
        let isCritical = notificationGr.getValue('critical') === '1';
        let isReminder = notificationGr.getValue('reminder') === '1';
        let description = this._getDescription(notificationGr, isCritical, isReminder);
        if (gs.nil(description)) {
            return;
        }
        notificationData.description = description;
        notificationData.state = notificationGr.getValue('status');
        notificationData.createdOn = notificationGr.getValue('sys_created_on');
        notificationData.sysId = notificationGr.getUniqueValue();
        notificationData.url = notificationGr.getValue('action_url');
        notificationData.isCritical = isCritical;
        notificationData.isReminder = isReminder;
        let iconData = this._fetchIconData(notificationGr.notification_content_config.getRefRecord(), isCritical, isReminder);

        let notification = Object.assign(notificationData, iconData);
        return notification;
    },

    /**
     * Function to get notifications of a user
     * @param {string} userID - ID of the user
     * @param {boolean} unreadOnly - get unread notifications instead of unseen
     * @param {number} windowStartTime - timestamp to filter records after it. If not given then fetches all records.
     * @param {number} windowSize - number of records to fetch. If not given then fetches all records.
     * @param {number} windowOffset - offset for pagination. If not given then fetches all records. Used with windowSize.
     * @returns {Array} Array of notification objects
     */
    getNotifications: function(windowStartTime, windowSize, windowOffset, unreadOnly, filterQuery, userID) {
        userID = userID || gs.getUserID();
        windowOffset = windowOffset || 0;
        let notificationsGr = new GlideRecordSecure(this.TABLE_NOTIFICATION_CONTENT);
        notificationsGr.addQuery("active", true);
        notificationsGr.addQuery("user", userID);
        notificationsGr.addQuery("portals", this.portalID);
        if (unreadOnly)
            notificationsGr.addQuery("status", '!=', this.STATE_OPEN);
        if (!gs.nil(filterQuery))
            notificationsGr.addEncodedQuery(filterQuery);
        notificationsGr.orderByDesc("order");
        notificationsGr.orderByDesc("sys_created_on");
        notificationsGr.orderByDesc("sys_id");

        if (windowStartTime)
            notificationsGr.addQuery("sys_created_on", "<", windowStartTime);
        if (windowSize) {
            notificationsGr.chooseWindow(windowOffset, windowOffset + windowSize, false);
        }

        notificationsGr.query();

        let notifications = [];

        while (notificationsGr.next()) {
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

    /**
     * Retrieve the list of sys_notification record ids that are linked to a portal content config
     * @returns {Array} list of sys_ids
     */
    getPortalNotificationIds: function() {
        const portalNotificationIds = [];
        const contentConfigGr = new GlideAggregate(this.TABLE_NOTIFICATION_CONTENT_CONFIG);
        contentConfigGr.groupBy('notification');
        contentConfigGr.query();
        while (contentConfigGr.next())
            portalNotificationIds.push(contentConfigGr.getValue('notification'));
        return portalNotificationIds;
    },

    /**
     * Function to retrieve a list of filters data object corresponding to each classifier
     * @param {string} classifierIdsList - List of sys_ids of classifiers that are applicable on a portal
     * @returns {Array} list of object in format [{id: <classifier_id>, name: <classifier_name>, queryString: "notificationIN<list of notifications>"}]
     */
    _fetchClassifierFilters: function(classifierIdsList) {
        const classifierNotificationMap = new Map();
        const classifierIdNameMap = new Map();
        const portalNotificationIds = this.getPortalNotificationIds();
        // Contains same elements as classifierIdsList but sorted
        let sortedClassifierIdsList = [];

        // Retrieve classifier names and map with their ids
        const classificationGr = new GlideRecordSecure(this.TABLE_NOTIFICATION_CLASSIFICATION);
        classificationGr.addQuery("sys_id", "IN", classifierIdsList);
        classificationGr.orderBy("name");
        classificationGr.query();
        while (classificationGr.next()) {
            sortedClassifierIdsList.push(classificationGr.getUniqueValue());
            classifierIdNameMap.set(classificationGr.getValue("sys_id"), classificationGr.getDisplayValue("name"));
        }

        // generate the map for a classifer and associated notifications
        classifierIdsList.forEach(classifierItem => classifierNotificationMap.set(classifierItem, []));

        const notificationGr = new GlideRecord(this.TABLE_SYS_NOTIFICATION);
        notificationGr.addQuery("sys_id", "IN", portalNotificationIds);
        notificationGr.addQuery("notification_classifier", "IN", classifierIdsList.join(","));
        notificationGr.query();
        while (notificationGr.next()) {
            const linkedClassifiers = notificationGr.notification_classifier.toString().split(",");
            linkedClassifiers.forEach(classifierItem => {
                if (classifierIdNameMap.has(classifierItem))
                    classifierNotificationMap.get(classifierItem).push(notificationGr.getValue("sys_id"));
            });
        }

        // generate filter items for each classifier
        const filters = [];
        sortedClassifierIdsList.forEach(classifierId => {
            const notificationIds = classifierNotificationMap.get(classifierId);
            if (gs.nil(notificationIds) || notificationIds.length == 0)
                return;
            filters.push({
                id: classifierId,
                name: classifierIdNameMap.get(classifierId),
                queryString: `notificationIN${notificationIds.join()}`
            });
        });
        return filters;
    },


    /**
     * Function to retrieve a list of filters data object from cache. If data is not present in cache, its computed.
     * @param {Array} portalClassifierList - List of sys_ids of classifiers that are applicable on a portal
     * @param {String} portalNotificationConfigId - Sys id of the notification portal config record. Cache should be invalidated if this record is updated.
     * @returns {Array} list of object in format [{id: <classifier_id>, name: <classifier_name>, queryString: "notificationIN<list of notifications>"}]
     */
    getFilters: function(portalClassifierList, portalNotificationConfigId) {
        if (gs.nil(portalClassifierList) || portalClassifierList.length == 0)
            return [];

        try {
            const filterListDump = sn_scoped_cache.ScopedCacheManager.get(this.CACHE_NAME, this.PORTAL_FILTERS_CACHE_KEY);
            if (filterListDump)
                return JSON.parse(filterListDump);
        } catch (e) {}

        const filters = this._fetchClassifierFilters(portalClassifierList);
        sn_scoped_cache.ScopedCacheManager.put(this.CACHE_NAME, this.PORTAL_FILTERS_CACHE_KEY, JSON.stringify(filters));
        return filters;
    },

    /**
     * Function to update the read status of a notification record.
     * @param {string} notificationSysID - sys id of the notification record
     * @param {boolean} isRead - indicates if the record is read or not
     * @returns {void}
     */
    updateReadStatus: function(notificationSysID, isRead) {
        let notificationsGr = new GlideRecordSecure(this.TABLE_NOTIFICATION_CONTENT);

        if (!notificationsGr.get(notificationSysID))
            return;
        notificationsGr.status = isRead ? this.STATE_OPEN : this.STATE_VIEW;
        notificationsGr.order = notificationsGr.critical && !isRead ? this.ORDER_CRITICAL : this.ORDER_DEFAULT;

        try {
            notificationsGr.update();
        } catch (error) {
            gs.error('Error updating notification content: ' + error.message);
            return null;
        }

    },

    /**
     * Function to mark all notifications for a user as read
     * @param {string} userID - ID of the user
     * @returns {void}
     */
    markAllAsRead: function() {
        // Not adding option for a user to call this method for a diffferent user (userID = userID || gs.getUserID()) since we have removed GlideRecordSecure. 
        let notificationsGr = new GlideRecord(this.TABLE_NOTIFICATION_CONTENT);
        notificationsGr.addQuery("active", true);
        notificationsGr.addQuery("status", "!=", this.STATE_OPEN);
        notificationsGr.addQuery("user", gs.getUserID());
        notificationsGr.query();

        notificationsGr.setValue("status", this.STATE_OPEN);
        notificationsGr.setValue("order", this.ORDER_DEFAULT);

        try {
            notificationsGr.updateMultiple();
        } catch (error) {
            gs.error('Error bulk updating notification content: ' + error.message);
            return null;
        }
    },

    /**
     * Function to soft delete / un-delete a notification
     * @param {string} notificationSysID - sys id of the notification record
     * @param {boolean} isActive - indicates if the record is soft deleted
     * @returns {void}
     */
    updateActiveStatus: function(notificationSysID, isActive) {
        let notificationsGr = new GlideRecordSecure(this.TABLE_NOTIFICATION_CONTENT);

        if (!notificationsGr.get(notificationSysID))
            return;

        notificationsGr.active = isActive;
        try {
            notificationsGr.update();
        } catch (error) {
            gs.error('Error updating notification content: ' + error.message);
            return null;
        }

    },

    /**
     * Function to schedule a reminder for a notification
     * @param {string} notificationSysID - sys id of the notification record
     * @param {number} minsFromNow - number of mins from now when the reminder should be scheduled
     * @param {string} dateTimeString - date time string in ISO format. e.g 2024-08-07T13:15:00.000+0530
     * @returns {void}
     */
    scheduleReminder: function(notificationSysID, minsFromNow, dateTimeString) {
        let notificationsGr = new GlideRecordSecure(this.TABLE_NOTIFICATION_CONTENT);

        if (!notificationsGr.get(notificationSysID) || (!minsFromNow && !dateTimeString))
            return;

        var processTime = new GlideDateTime();
        if (minsFromNow)
            processTime.addSeconds(minsFromNow * 60);
        else if (dateTimeString)
            processTime = new GlideDateTime(dateTimeString);

        gs.eventQueueScheduled(this.EVENT_CREATE_REMINDER, notificationsGr, null, null, processTime);
        gs.addInfoMessage(gs.getMessage('Reminder set successfully.'));
    },

    /**
     * Function to create reminder notification from an existing notification
     * @param {GlideRecord} notificationContentGr - GlideRecord object for the notification content
     * @returns {GlideRecord} - GlideRecord object for the created reminder
     */
    createReminder: function(notificationContentGr) {
        let reminderGr = new GlideRecord(this.TABLE_NOTIFICATION_CONTENT);
        reminderGr.initialize();

        // List of fields to copy for reminder
        let fields = sn_ex_sp_notifs.PortalNotificationConstants.REMINDER_FIELDS;

        fields.forEach(function(field) {
            reminderGr[field] = notificationContentGr[field];
        });

        reminderGr.reminder = true;
        if (reminderGr.critical) {
            reminderGr.critical = false;
            reminderGr.order = 100;
        }
        reminderGr.status = this.STATE_NEW;
        try {
            reminderGr.insert();
            return reminderGr;
        } catch (error) {
            gs.error('Error creating reminder: ' + error.message);
            return null;
        }
    },
    type: 'PortalNotificationsUtilSNC'
};
