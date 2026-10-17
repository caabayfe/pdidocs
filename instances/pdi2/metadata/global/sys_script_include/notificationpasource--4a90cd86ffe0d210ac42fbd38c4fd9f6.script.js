var NotificationPASource = Class.create();
NotificationPASource.prototype = {
    DEFAULT_TOTAL_RECORDS: 10,
    initialize: function() {},
	isDebugEnabled: function() {
		var propertyValue = gs.getProperty("glide.notification.dashboard.pa_source.debug", "false");
		return propertyValue == "true";
	},
    _invokeAPI: function(dataConfigs, filterConfigs, otherKeys) {
        var dataConfigurationsObject = this._getDatConfigurations(dataConfigs);
        var filterConfigurationsObject = this._getFilterConfigurations(filterConfigs || {});
        var req = {
            dataConfigurations: dataConfigurationsObject,
            filterConfigurations: filterConfigurationsObject
        };
		var requestString = JSON.stringify(req);
		if (this.isDebugEnabled())
			GlideLog.debug("PA request submitted: " + requestString);
		otherKeys = otherKeys  || {};
		var cacheKey = otherKeys.cacheKey || "123";
			//ScriptableParDataAPI
	    var parAPI = new SNC.ScriptableAnalyticsCacheAPI(requestString, JSON.stringify({
			cache_enabled: gs.getProperty("glide.notification.dashboard.cache.enabled", "false"),
			additional_key: cacheKey
		}));
		var parData = parAPI.getData();
        var parResults = JSON.parse(parData);

        if (this.isDebugEnabled())
			GlideLog.debug("PA response received: " + parData);
        return parResults[0].response.data || [];
    },
    _getDatConfigurations: function(dataConfigs) {
        var indicator = dataConfigs.indicator || NotificationDashboardConstants.EMAIL_INDICATOR;
        var breakdownCondition = dataConfigs.breakdownCondition || [];
        var totalRecords = dataConfigs.totalRecords || this.DEFAULT_TOTAL_RECORDS;
        var returnBreakdowns = dataConfigs.returnBreakdowns || [];
		var sortOrder = dataConfigs.sortOrder || "desc";
        var dataConfiguration = {
            "sortBy": "value",
            "sortOrder": sortOrder,
            "sourceType": "indicator",
            "dataCategory": "group",
            "order": 0,
            "numberOfGroups": totalRecords,
            "uuid": {
                "indicator": indicator,
                "breakdowns":breakdownCondition
            },
            "aggregateFunction": "sum",
            "shouldApplyDateRange": true,
            "showChangeFrom": "previous",
            "groupBy": returnBreakdowns
        }
        return [dataConfiguration];
    },
    _getFilterConfigurations: function(filterConfigs) {
        var filterConfigurations = [];
        var order = 0;
        if (filterConfigs.startDate && filterConfigs.endDate) {
            order++;
            filterConfigurations.push({
                "order": order,
                "type": "date",
                "label": "Label",
                "source": {},
                "start": filterConfigs.startDate,
                "end": filterConfigs.endDate,
                "apply_to": [],
                "origin": "FILTER_COMPONENT"
            });
        }
        return filterConfigurations;
    },
    _filterAndReturnResults: function(results, convertFunction) {
        return results.slice(1).map(function(x) {
            return convertFunction(x[0], x[1]);
        });
    },
    getTopNotifications: function(filterOptions) {
		var cacheKey = this._cacheKey("TopNotifications", filterOptions);
        var results = this._invokeAPI({
            returnBreakdowns: [NotificationDashboardConstants.NOTIFICATION_BREAKDOWN],
			totalRecords: filterOptions.totalRecords,
			sortOrder: filterOptions.sortOrder
        }, filterOptions, {
			cacheKey: cacheKey
		});
        convertFunction = (breakdownId, aggregateValue) => {
            var obj = {};
            obj[NotificationDashboardConstants.NOTIFICATION_SYS_ID] = breakdownId;
            obj[NotificationDashboardConstants.TRIGERRED_COUNT] = this._convertTriggerToInt(aggregateValue);
            return obj;
        };
        return this._filterAndReturnResults(results, convertFunction);
    },
    getTopRecipients: function(filterOptions) {
		var cacheKey = this._cacheKey("TopRecipients", filterOptions);
        var results = this._invokeAPI({
            returnBreakdowns: [NotificationDashboardConstants.RECIPIENT_BREAKDOWN]
        }, filterOptions, {
			cacheKey: cacheKey
		});
        convertFunction = (breakdownId, aggregateValue) => {
            var obj = {};
            obj[NotificationDashboardConstants.USER_SYS_ID] = breakdownId;
            obj[NotificationDashboardConstants.TRIGERRED_COUNT] = this._convertTriggerToInt(aggregateValue);
            return obj;
        };
        return this._filterAndReturnResults(results, convertFunction);
    },
	getTopTables: function(filterOptions) {
		var cacheKey = this._cacheKey("TopTables", filterOptions);
 		var results = this._invokeAPI({
            returnBreakdowns: [NotificationDashboardConstants.TABLE_BREAKDOWN]
        }, filterOptions, {
			cacheKey: cacheKey
		});
		convertFunction = (breakdownId, aggregateValue) => {
            var obj = {};
            obj[NotificationDashboardConstants.TABLE_SYS_ID] = breakdownId;
            obj[NotificationDashboardConstants.TRIGERRED_COUNT] = this._convertTriggerToInt(aggregateValue);
            return obj;
        };
        return this._filterAndReturnResults(results, convertFunction);
	},
    getTopNotificationsOfARecipient: function(userSysId, filterOptions) {
		var cacheKey = this._cacheKey("TopNotifOfRecipient"+ userSysId, filterOptions);
        var results = this._invokeAPI({
            returnBreakdowns: [NotificationDashboardConstants.NOTIFICATION_BREAKDOWN],
            breakdownCondition: [{
                "sysId": NotificationDashboardConstants.RECIPIENT_BREAKDOWN,
                "elementSysIds": [userSysId]
            }]
        }, filterOptions, {
			cacheKey: cacheKey
		});

        convertFunction = (breakdownId, aggregateValue) => {
            var obj = {};
            obj[NotificationDashboardConstants.NOTIFICATION_SYS_ID] = breakdownId;
            obj[NotificationDashboardConstants.TRIGERRED_COUNT] = this._convertTriggerToInt(aggregateValue);
            return obj;
        };
        return this._filterAndReturnResults(results, convertFunction);
    },
	getNotificationsCount: function(notifList, filterOptions) {
		if (!notifList || notifList.length == 0) {
            return [];
        }
		var cacheKey = this._cacheKey("NotificationCount", filterOptions);
		var results = this._invokeAPI({
            returnBreakdowns: [NotificationDashboardConstants.NOTIFICATION_BREAKDOWN],
            breakdownCondition: [{
                "sysId": NotificationDashboardConstants.NOTIFICATION_BREAKDOWN,
                "elementSysIds": notifList
            }],totalRecords: notifList.length
        }, filterOptions, {
			cacheKey: cacheKey
		});
		convertFunction = (breakdownId, aggregateValue) => {
            var obj = {};
            obj[NotificationDashboardConstants.NOTIFICATION_SYS_ID] = breakdownId;
            obj[NotificationDashboardConstants.TRIGERRED_COUNT] = this._convertTriggerToInt(aggregateValue);
            return obj;
        };
        return this._filterAndReturnResults(results, convertFunction);

	},
	getTopNotificationsOfATable: function(tableSysId, filterOptions) {
		var cacheKey = this._cacheKey("TopNotifOfTable_" + tableSysId, filterOptions);
 		var results = this._invokeAPI({
            returnBreakdowns: [NotificationDashboardConstants.NOTIFICATION_BREAKDOWN],
            breakdownCondition: [{
                "sysId": NotificationDashboardConstants.TABLE_BREAKDOWN,
                "elementSysIds": [tableSysId]
            }]
        }, filterOptions,{
			cacheKey: cacheKey
		} );

        convertFunction = (breakdownId, aggregateValue) => {
            var obj = {};
            obj[NotificationDashboardConstants.NOTIFICATION_SYS_ID] = breakdownId;
            obj[NotificationDashboardConstants.TRIGERRED_COUNT] = this._convertTriggerToInt(aggregateValue);
            return obj;
        };
        return this._filterAndReturnResults(results, convertFunction);
	},
	getTopCategory: function(filterOptions) {
		var cacheKey = this._cacheKey("TopCategory", filterOptions);
 		var results = this._invokeAPI({
            returnBreakdowns: [NotificationDashboardConstants.CATEGORY_BREAKDOWN],
				totalRecords: filterOptions.totalRecords
        }, filterOptions,{
			cacheKey: cacheKey
		} );
		convertFunction = (breakdownId, aggregateValue) => {
            var obj = {};
            obj[NotificationDashboardConstants.CATEGORY_SYS_ID] = breakdownId;
            obj[NotificationDashboardConstants.TRIGERRED_COUNT] = this._convertTriggerToInt(aggregateValue);
            return obj;
        };
        return this._filterAndReturnResults(results, convertFunction);
	},
	_convertTriggerToInt: function(aggregateValue) {
		aggregateValue = aggregateValue.replace(/,/g, "");
		var intValue = parseInt(aggregateValue, 10);
	
		return isNaN(intValue) ? 0 : intValue; 
	},
	_cacheKey: function(prefix, filterOptions) {
		var key = prefix;
		key += filterOptions.startDate + "_";
		key += filterOptions.endDate;
		return key;
	},
    type: 'NotificationPASource'
};
