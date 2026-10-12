var NotificationDashboard = Class.create();
NotificationDashboard.prototype = {
    paDataSource: new NotificationPASource(),
    notificationDashboardUtils: new NotificationDashboardUtils(),
    sw: new GlideStopWatch(),
    initialize: function() {},
    _defaultDateOptions: function(criteria) {
        //Default the criteria to 1 month
        if (criteria.startDate && criteria.endDate) {
            return criteria;
        }
        var currentDateTime = new GlideDateTime();
        criteria.endDate = currentDateTime.getDate().getValue();
        currentDateTime.addMonthsUTC(-1);
        criteria.startDate = currentDateTime.getDate().getValue();
        return criteria;
    },
    _getTopCategory: function(criteria) {
        var filter = this._defaultDateOptions(criteria);
        var parTableResults = this.paDataSource.getTopCategory(filter);
        var categoryResults = new NotificationDashboardResult(parTableResults, NotificationDashboardConstants.CATEGORY_SYS_ID);
        this.notificationDashboardUtils.fetchCategoryDetails(categoryResults.getKeySet(), categoryResults.aggregateFn());
        return categoryResults;
    },
    getTopCategory: function(criteria) {
        var categoryResults = this._getTopCategory(criteria);
        return categoryResults.getResultList();
    },
	getTriggerCountByNotificationID: function(criteria){
        var filter = this._defaultDateOptions(criteria);
		var notificationList = [criteria.notificationID];
		var parResults = this.paDataSource.getNotificationsCount(notificationList, filter);
		return parResults;
	},
    getTopNotifications: function(criteria) {
        var filter = this._defaultDateOptions(criteria);
        var parResults = this.paDataSource.getTopNotifications(filter);
        var results = new NotificationDashboardResult(parResults, NotificationDashboardConstants.NOTIFICATION_SYS_ID);
        this.notificationDashboardUtils.fetchNotificatonDetails(results.getKeySet(), results.aggregateFn());
        this.notificationDashboardUtils.fetchPreferenceInformation(results.getKeySet(), results.aggregateFn());
        return results.getResultList();
    },
    getTopOptedOutNotifications: function(criteria) {
        var filter = this._defaultDateOptions(criteria);
        var notificationList = this.notificationDashboardUtils.getTopOptedOutNotifications(10, filter);
        var parResults = this.paDataSource.getNotificationsCount(notificationList, filter);
        var map = {};
        parResults.forEach(function(result) {
            map[result[NotificationDashboardConstants.NOTIFICATION_SYS_ID]] = result;
        });
        for (i = 0; i < notificationList.length; i++) {
            if (!map[notificationList[i]]) {
                var record = {};
                record[NotificationDashboardConstants.NOTIFICATION_SYS_ID] = notificationList[i];
                record[NotificationDashboardConstants.TRIGERRED_COUNT] = 0;
                parResults.push(record);
            }
        }
        var results = new NotificationDashboardResult(parResults, NotificationDashboardConstants.NOTIFICATION_SYS_ID);
        this.notificationDashboardUtils.fetchNotificatonDetails(results.getKeySet(), results.aggregateFn());
        this.notificationDashboardUtils.fetchPreferenceInformation(results.getKeySet(), results.aggregateFn());
        return results.getResultList();
    },
    _getTopRecipients: function(filter) {
        var parRecipientResults = this.paDataSource.getTopRecipients(filter);
        var results = new NotificationDashboardResult(parRecipientResults, NotificationDashboardConstants.USER_SYS_ID);
        this.notificationDashboardUtils.fetchUserDetails(results.getKeySet(), results.aggregateFn());
        return results;
    },
    getTopRecipients: function(criteria) {
        var results = this._getTopRecipients(this._defaultDateOptions(criteria));
        return results.getResultList();
    },
    _getTopNotificationsOfARecipient(userId, filter) {
        var parNotificationResults = this.paDataSource.getTopNotificationsOfARecipient(userId, filter);
        var results = new NotificationDashboardResult(parNotificationResults, NotificationDashboardConstants.NOTIFICATION_SYS_ID);
        this.notificationDashboardUtils.fetchNotificatonDetails(results.getKeySet(), results.aggregateFn());
        return results;
    },
    getTopNotificationsForARecipient: function(userId, criteria) {
        var results = this._getTopNotificationsOfARecipient(userId, this._defaultDateOptions(criteria));
        return results.getResultList();
    },

    getTopRecipientAndNotifications: function(criteria) {
        var filter = this._defaultDateOptions(criteria);
        var results = this._getTopRecipients(filter);
        var keys = results.getKeySet();
        for (var i = 0; i < keys.length; i++) {
            var userStats = results.getItem(keys[i]);

            notificationResults = this._getTopNotificationsOfARecipient(userStats[NotificationDashboardConstants.USER_SYS_ID], filter);

            results.addChildren(keys[i], notificationResults.getResultList());
        }
        return results.getResultList();
    },
    _getTopTables(filter) {
        var parTableResults = this.paDataSource.getTopTables(filter);
        var tableResults = new NotificationDashboardResult(parTableResults, NotificationDashboardConstants.TABLE_SYS_ID);
        this.notificationDashboardUtils.fetchTableDetails(tableResults.getKeySet(), tableResults.aggregateFn());
        return tableResults;
    },
    getTopTables(criteria) {
        var filter = this._defaultDateOptions(criteria);
        var tableResults = this._getTopTables(filter);
        return tableResults.getResultList();
    },
    _getTopNotificationsOfATable: function(tableSysId, filter) {
        var notificationParResults = this.paDataSource.getTopNotificationsOfATable(tableSysId, filter);
        var notificationResults = new NotificationDashboardResult(notificationParResults, NotificationDashboardConstants.NOTIFICATION_SYS_ID);
        this.notificationDashboardUtils.fetchNotificatonDetails(notificationResults.getKeySet(), notificationResults.aggregateFn());
        return notificationResults;
    },
    getTopNotificationsOfATable: function(tableSysId, criteria) {
        var results = this._getTopNotificationsOfATable(tableSysId, this._defaultDateOptions(criteria));
        return results.getResultList();
    },

    getTopTablesAndNotifications: function(criteria) {
        var filter = this._defaultDateOptions(criteria);
        var tableResults = this._getTopTables(filter);

        var keys = tableResults.getKeySet();

        for (var i = 0; i < keys.length; i++) {
            var tableStats = tableResults.getItem(keys[i]);

            notificationResults = this._getTopNotificationsOfATable(tableStats[NotificationDashboardConstants.TABLE_SYS_ID], this._defaultDateOptions());

            notificationResults.addChildren(keys[i], notificationResults.getResultList());
        }
        return tableResults.getResultList();
    },
    fetchUnusedNotificationsCount: function(criteria) {
        var filter = this._defaultDateOptions(criteria);
        var results = this.notificationDashboardUtils.fetchUnusedNotifications(filter);
        return results ? results.length : 0;
    },
    fetchNotificationRecordById: function(request) {
        var gr = new GlideRecord("sysevent_email_action");
        gr.addQuery("sys_id", request.notificationID);
        gr.query();
        var notificationRecord = {};
        if (gr.next()) {
            notificationRecord.name = gr.getValue('name');
            notificationRecord.sys_id = request.notificationID;
            notificationRecord.active = gr.getValue('active');
            notificationRecord.subscribable = gr.getValue('subscribable');
            notificationRecord.category = gr.getDisplayValue('category');
            notificationRecord.table = gr.getDisplayValue('collection');
            notificationRecord.application = gr.getDisplayValue('sys_scope');
			notificationRecord.scope = gr.getValue('sys_scope');
            notificationRecord.createdBy = gr.getValue('sys_created_by');
            notificationRecord.updatedBy = gr.getValue('sys_updated_by');
            notificationRecord.updatedOn = this.dateFormatter(gr.getValue('sys_updated_on'));
        }
        return notificationRecord;
    },

    dateFormatter: function(dateString) {
        var datePart = dateString.split(" ")[0];
        var date = new Date(datePart);
        var options = {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        };
        return date.toLocaleDateString('en-GB', options).replace(',', '');
    },

    getAllNotifications: function(filterCriteria) {
        filterCriteria = this._defaultDateOptions(filterCriteria);
        var tab = filterCriteria.tab;
        var categories = filterCriteria.categories || [];
        var tables = filterCriteria.tables || [];
        var type = filterCriteria["type"];
        var state = filterCriteria["state"];

        var notificationList = [];
        var parNotificationResults = [];
        var top_records = this._getPropertyValue("glide.notification.dashboard.count_of_top_records", 100);
        var chunkSize = this._getPropertyValue("glide.notification.dashboard.pa.chunk_size", 1000);
        var isDirectCallToPA = false;
        var fillMissingRecordsWithZero = false;
        switch (tab) {
            case "least_trigerred_notification":
                isDirectCallToPA = tables.length == 0 && categories.length == 0 && type == "all" && state == "all";
                if (!isDirectCallToPA) {
                    notificationList = this.notificationDashboardUtils.getAllNotifications(filterCriteria);
                }
                break;
            case "most_trigerred_notification":
                isDirectCallToPA = tables.length == 0 && categories.length == 0 && type == "all" && state == "all";
                if (!isDirectCallToPA) {
                    notificationList = this.notificationDashboardUtils.getAllNotifications(filterCriteria);
                }
                break;
            case "most_opt_out_notification":
                notificationList = this.notificationDashboardUtils.getTopOptedOutNotifications(top_records, filterCriteria);
                fillMissingRecordsWithZero = true;
                break;
            case "unused_notification":
                if (filterCriteria.startDate && filterCriteria.endDate) {
                    notificationList = this.notificationDashboardUtils.fetchUnusedNotifications(filterCriteria);
                    fillMissingRecordsWithZero = true;
                }
                break;
        }
        if (!isDirectCallToPA) {
            //Split the notifications and collect the pa results
            var chunks = this._getChunks(notificationList, chunkSize);
            for (var i = 0; i < chunks.length; i++) {
                var tempResults = this.paDataSource.getNotificationsCount(chunks[i], filterCriteria);
                (new ArrayUtil()).concat(parNotificationResults, tempResults);
            }
            if (fillMissingRecordsWithZero) {
                //create a map with results
                var zeroResults = [];
                var map = {};
                parNotificationResults.forEach(function(result) {
                    map[result[NotificationDashboardConstants.NOTIFICATION_SYS_ID]] = result;
                });
                for (i = 0; i < notificationList.length; i++) {
                    if (!map[notificationList[i]]) {
                        var record = {};
                        record[NotificationDashboardConstants.NOTIFICATION_SYS_ID] = notificationList[i];
                        record[NotificationDashboardConstants.TRIGERRED_COUNT] = 0;
                        parNotificationResults.push(record);
                    }
                }
            }
            //fetch top n records
            parNotificationResults = this._fetchTopRecordsAfterSorting(parNotificationResults, top_records, (tab == "most_trigerred_notification") || (tab == "least_trigerred_notification"));
        } else {
            var sortOrder = (tab == "most_trigerred_notification") ? "desc" : "asc";
            var paFilters = {
                sortOrder: sortOrder,
                totalRecords: top_records
            };
            Object.assign(paFilters, filterCriteria);
            parNotificationResults = this.paDataSource.getTopNotifications(paFilters);
        }
        var results = new NotificationDashboardResult(parNotificationResults, NotificationDashboardConstants.NOTIFICATION_SYS_ID);
        this.notificationDashboardUtils.fetchNotificatonDetails(results.getKeySet(), results.aggregateFn());
        this.notificationDashboardUtils.fetchPreferenceInformation(results.getKeySet(), results.aggregateFn());
        return results.getResultList();
    },
    _getPropertyValue: function(name, defaultValue) {
        var value = gs.getProperty(name, defaultValue);
        var intValue = Number(value);
        if (intValue && Number.isInteger(intValue) && intValue != 0)
            return intValue;

        return defaultValue;
    },
    _fetchTopRecordsAfterSorting: function(records, size, isDescOrder) {

        function compare(r1, r2) {
            var v1 = r1[NotificationDashboardConstants.TRIGERRED_COUNT];
            var v2 = r2[NotificationDashboardConstants.TRIGERRED_COUNT];

            var diff = 0;
            if (v1 > v2) {
                diff = -1;
            } else if (v1 < v2) {
                diff = 1;
            }
            return isDescOrder ? diff : -diff;
        }
        return records.sort(compare).slice(0, size);
    },
    _getChunks: function(list, chunkSize) {
        var result = [];

        for (var i = 0; i < list.length; i += chunkSize) {
            result.push(list.slice(i, i + chunkSize)); // Slice the array into chunks
        }
        return result;
    },
    getUnsubscribedCountNotifications: function(criteria) {
        var filter = this._defaultDateOptions(criteria);
        var unsubscriptionCount = this.notificationDashboardUtils.fetchSubscriptionInformation(criteria.notificationID, false);
        var totalSubscriptionCount = this.notificationDashboardUtils.fetchSubscriptionInformation(criteria.notificationID, true);
        return unsubscriptionCount + "/" + totalSubscriptionCount;
    },

    type: 'NotificationDashboard'
};
