var ActivityConfigurationUtilSNC = Class.create();
ActivityConfigurationUtilSNC.prototype = {
    initialize: function() {
        this.ITEM_SUMMARY_COUNT_LIMIT = 10;
        this.recordLimit = 0;
        this.WINDOW_SIZE = 20;
        this.EMPLOYEE_CENTER_CACHE = 'employee_center_cache';
    },
    isActivityConfigDetailPresent: function(sysID) {
        var itemGr = new GlideRecord("sn_ex_sp_activity_config_detail");
        itemGr.addQuery("activity_configuration", sysID);
        itemGr.setLimit(1);
        itemGr.query();
        return itemGr.hasNext();
    },

    /*
     * This API is designed to perform update operations on records in the "Activity Configuration" table.
     * @param {sysID} - sys ID of the table record
     * @param {fieldName} -  field name to be updated
     * @param {fieldValue} -  New value of the field
     */
    updateActvityConfiguration: function(sysID, fieldName, fieldValue) {
        var activityConfigGr = new GlideRecord("sn_ex_sp_activity_configuration");

        if (activityConfigGr.canWrite() && activityConfigGr.get(sysID)) {
            activityConfigGr.setValue(fieldName, fieldValue);
            activityConfigGr.update();
        }
    },

    /*
     * To get activity configurations for building the widget.
     * @output: Object with names and icons of activity configurations.
     */
    _getActivityConfigs: function() {
        var activityConfigList = [];
        var cacheKey = 'activityConfig_'.concat(gs.getSession().getLanguage());
        var activityConfigsFromCache = sn_scoped_cache.ScopedCacheManager.get(this.EMPLOYEE_CENTER_CACHE, cacheKey);
        if (activityConfigsFromCache) {
            activityConfigList = JSON.parse(activityConfigsFromCache)[cacheKey];
        } else {
            var gr = new GlideRecord('sn_ex_sp_activity_configuration');
            gr.addActiveQuery();
            gr.orderBy('order');
            gr.orderBy('activity_name');
            gr.query();
            while (gr.next()) {
                var activityConfigRecord = {};
                activityConfigRecord.sysId = gr.getUniqueValue();
                activityConfigRecord.itemName = gr.getDisplayValue('activity_name');
                if (gr.getValue('target_page') === 'INTERNAL') {
                    activityConfigRecord.itemUrl = '?id=' + gr.internal_link.getDisplayValue().toString();
                } else {
                    activityConfigRecord.itemUrl = gr.getValue('external_link');
                    activityConfigRecord.target = '_blank';
                }
                activityConfigRecord.sortBy = gr.getValue('sort_by') ? gr.getValue('sort_by') : 'sys_created_on';
                activityConfigRecord.sortOrder = gr.getValue('sort_order');
                activityConfigRecord.advanced = Boolean(gr.advanced);
                activityConfigRecord.primary = Boolean(gr.primary);
                activityConfigRecord.icon = gr.getValue("icon") ? gr.getValue("icon") : "list-alt";
                activityConfigList.push(activityConfigRecord);
            }
            var activityConfigsToBeCached = {};
            activityConfigsToBeCached[cacheKey] = activityConfigList;
            sn_scoped_cache.ScopedCacheManager.put(this.EMPLOYEE_CENTER_CACHE, cacheKey, JSON.stringify(activityConfigsToBeCached));
        }
        return activityConfigList;
    },

    /*
     * To get activities data for building the widget.
     * @output: Object with detailed and summary sections as per configuration.
     */
    getActivityData: function(recordLimit, instanceId, portalId, liteView, statsParentId) {
        var activityData = {
            primaryCountData: [],
            showViewAll: "",
            summaryCountData: [],
            listViewData: []
        };
        var activityConfigList = this._getActivityConfigs();
        if (liteView) {
            activityData.summaryCountData = activityConfigList;
            return activityData;
        }
        this.recordLimit = recordLimit;

        var stats = {};
        stats.callerId = instanceId;
        stats.callerTable = instanceId ? 'sp_instance' : '';
        stats.parentId = statsParentId;
        stats.textPrefix = 'Get Activity Data';
        stats.userId = gs.getUserID();
        var performanceIndicatorUtil = new sn_ex_sp.PerformanceIndicatorUtil();
        for (var i = 0; i < activityConfigList.length; i++) {
            activityConfigRecord = activityConfigList[i];

            stats.startTime = new GlideDateTime();

            var itemData = {
                totalItemCount: 0,
                itemCount: 0,
                itemName: "",
                itemUrl: "",
                target: "",
                icon: ""
            };

            // Validate User Criteria
            if (!(this._validateUserCriteria(gs.getUserID(), activityConfigRecord.sysId))) {
                stats.refTable = 'sn_ex_sp_activity_configuration';
                stats.refRecordId = activityConfigRecord.sysId;
                stats.shortDesc = '';
                performanceIndicatorUtil.postHotspot(stats);
                continue;
            }
            itemData.itemName = activityConfigRecord.itemName;
            itemData.itemUrl = activityConfigRecord.itemUrl;
            if (activityConfigRecord.target) {
                itemData.target = activityConfigRecord.target;
            }
            var activityConfigGr = null;
            if (activityConfigRecord.advanced) {
                activityConfigGr = this._getActivityConfigGr(activityConfigRecord.sysId);
                itemData.itemCount = this._getAdvancedData(activityConfigGr, portalId);
            } else {
                itemData.itemCount = this._getNonAdvancedData(activityConfigRecord.sysId);
            }
            itemData.totalItemCount = itemData.itemCount;
            if (itemData.itemCount > 9) {
                itemData.itemCount = '9+';
            }
            itemData.icon = activityConfigRecord.icon;
            if (activityConfigRecord.primary) {
                activityData.primaryCountData.push(itemData);
                activityData.showViewAll = itemData.totalItemCount > this.recordLimit ? true : false;
                if (itemData.totalItemCount > 0) {
                    try {
                        if (activityConfigRecord.advanced) {
                            activityData.listViewData = this._getAdvancedListViewData(activityConfigGr);
                        } else {
                            activityData.listViewData = this._getNonAdvancedListViewData(activityConfigRecord.sysId, itemData, activityConfigRecord.sortBy, activityConfigRecord.sortOrder);
                        }
                    } catch (err) {
                        gs.addErrorMessage(gs.getMessage('Error while fetching List View'));
                    }
                }
            } else {
                activityData.summaryCountData.push(itemData);
            }

            stats.refTable = 'sn_ex_sp_activity_configuration';
            stats.refRecordId = activityConfigRecord.sysId;
            stats.shortDesc = '';
            performanceIndicatorUtil.postHotspot(stats);
        }
        return activityData;
    },
    _validateUserCriteria: function(user, activityRecordSysId) {
        var userCriteriaGR = new GlideRecord('sn_ex_sp_activity_user_criteria_mtom');
        userCriteriaGR.addQuery('activity', activityRecordSysId);
        userCriteriaGR.query();
        var userCriteriaExists = false;
        while (userCriteriaGR.next()) {
            if (userCriteriaGR.user_criteria.active) {
                userCriteriaExists = true;
                var criteriaList = [];
                criteriaList.push(userCriteriaGR.user_criteria.sys_id);
                if (sn_uc.UserCriteriaLoader.userMatches(user, criteriaList)) {
                    return true;
                }
            }
        }
        if (!userCriteriaExists) {
            return true;
        }
        return false;
    },
    /**
     * @input: glideRecord of sn_ex_sp_my_item_configuration.
     * @output: List view array.
     **/
    _getAdvancedListViewData: function(gr) {
        var listViewData = [];
        if (gr.getValue('list_view_script')) {
            var vars = {
                'recordsLimit': this.recordLimit
            };
            var evaluator = new GlideScopedEvaluator();
            var listData = evaluator.evaluateScript(gr, 'list_view_script', vars);
            var index = 0;
            if (listData && (listData.length > 0)) {
                while (index < listData.length && index < this.recordLimit) {
                    if (this._isValidActivityObject(listData[index])) {
                        listViewData.push(listData[index]);
                        index = index + 1;
                    }
                }
            }
        }
        return listViewData;
    },
    /**
     * To get the List view data for activity center widget
     * @output: returns list view data
     **/
    _getNonAdvancedListViewData: function(activityRecordSysId, itemData, sortBy, sortOrder) {
        var listViewDataForSortBy = [];
        var listViewDataForCreatedOn = [];
        var listViewAdvancedData = [];
        var configDataGr = new GlideRecord('sn_ex_sp_activity_config_detail');
        configDataGr.addActiveQuery();
        configDataGr.addQuery('activity_configuration', activityRecordSysId);
        configDataGr.orderBy('order');
        configDataGr.query();
        while (configDataGr.next()) {
            var configType = configDataGr.getValue('list_view_mapping');
            if (configType === 'BASIC') {
                this._getPrimaryActivityBasicData(configDataGr, listViewDataForSortBy, listViewDataForCreatedOn, itemData, sortBy, sortOrder);
            } else {
                var tempListViewAdvancedData = this._getPrimaryActivityAdvancedData(configDataGr, sortBy, sortOrder);
                if (!tempListViewAdvancedData)
                    continue;
                if (!tempListViewAdvancedData[0].sortFieldValue)
                    listViewAdvancedData = listViewAdvancedData.concat(tempListViewAdvancedData);
                else
                    listViewDataForSortBy = listViewDataForSortBy.concat(tempListViewAdvancedData);

            }
        }
        listViewDataForSortBy.sort(this._customSort);
        listViewDataForCreatedOn.sort(this._customSort);
        return listViewDataForSortBy.concat(listViewDataForCreatedOn).concat(listViewAdvancedData).slice(0, this.recordLimit);
    },
    /**
     * @input: glideRecord of sn_ex_sp_my_item_configuration.
     * @output: returns item count
     **/
    _getAdvancedData: function(gr, portalId) {
        var evaluator = new GlideScopedEvaluator();
        var vars = {
            'portalId': portalId
        };
        var itemCount = evaluator.evaluateScript(gr, 'items_count_script', vars);
        return itemCount;
    },
    /**
     * @input: glideRecord of sn_ex_sp_my_item_configuration.
     * @output: returns item count
     **/
    _getNonAdvancedData: function(activityRecordSysId) {
        var itemSummaryCount = 0;
        var configDataGr = new GlideRecord('sn_ex_sp_activity_config_detail');
        configDataGr.addActiveQuery();
        configDataGr.addQuery('activity_configuration', activityRecordSysId);
        configDataGr.orderBy('order');
        configDataGr.query();
        while (configDataGr.next() && itemSummaryCount < this.ITEM_SUMMARY_COUNT_LIMIT) {
            var table = configDataGr.getValue('table');
            var conditions = configDataGr.getValue('conditions');
            var dataGr = new GlideRecord(table);
            dataGr.addEncodedQuery(conditions);
            itemSummaryCount = itemSummaryCount + this._getItemRecordsCount(configDataGr, itemSummaryCount, this.WINDOW_SIZE, dataGr);
        }
        return itemSummaryCount;
    },
    /**
     * to fetch the primary activity list view data
     * @input: glide record of activity details
     * @input: Summary View activity Json
     * @input: listViewData Json
     **/
    _getPrimaryActivityBasicData: function(configDataGr, listViewDataForSortBy, listViewDataForCreatedOn, itemData, sortBy, sortOrder) {
        var table = configDataGr.getValue('table');
        var tableName = table ? table.toString() : "";
        var condition = configDataGr.getValue('conditions');
        var conditions = condition ? condition.toString() : "";
        var badge = configDataGr.getValue('badge');
        var badgeColor = configDataGr.getValue('badge_color');
        var image = configDataGr.getValue('image');
        var title = configDataGr.getValue('title');
        var description = configDataGr.getValue('description');
        var field1 = configDataGr.getValue('field_1');
        var field2 = configDataGr.getValue('field_2');
        var targetPage = configDataGr.getValue('target_page');
        var actionGroup = configDataGr.getValue('action_group_record');
        var gr = new GlideRecord(tableName);
        var isValidSortByField = gr.isValidField(sortBy);
        if (!isValidSortByField) {
            sortBy = 'sys_created_on';
            sortOrder = 'asc';
        }
        var sortByType = this._getFieldType(gr.getElement(sortBy).getED().getInternalType());
        if (sortOrder === 'asc') {
            gr.orderBy(sortBy);
        } else {
            gr.orderByDesc(sortBy);
        }
        gr.addEncodedQuery(conditions);
        gr.setLimit(this.recordLimit);
        gr.query();
        while (gr.next()) {
            var itemDetail = {
                badge: badge ? this._getFormattedFieldValue(gr, badge) : "",
                badgeColor: badgeColor ? badgeColor : "",
                image: image ? this._getFormattedFieldValue(gr, image) : "",
                title: this._getFormattedFieldValue(gr, title),
                description: description ? this._getFormattedFieldValue(gr, description) : "",
                field1Label: field1 ? gr.getElement(field1).getLabel() : "",
                field1Value: field1 ? this._getFormattedFieldValue(gr, field1) : "",
                field2Label: field2 ? gr.getElement(field2).getLabel() : "",
                field2Value: field2 ? this._getFormattedFieldValue(gr, field2) : "",
                itemUrl: "",
                target: "",
                sortFieldValue: gr.getValue(sortBy),
                sortByType: sortByType,
                sortOrder: sortOrder
            };
            if (actionGroup) {
                var actionsWidgetDetail = {
                    parentTable: tableName,
                    parentRecordSysId: gr.sys_id.toString(),
                    actionGrpSysId: actionGroup
                };
                itemDetail.actionsWidgetDetail = actionsWidgetDetail;
            }
            if (targetPage && targetPage === 'INTERNAL') {
                itemDetail.itemUrl = '?id=' + configDataGr.internal_link.getDisplayValue().toString();
            } else if (targetPage && targetPage === 'EXTERNAL') {
                itemDetail.itemUrl = configDataGr.getValue('external_link');
                itemDetail.target = '_blank';
            } else {
                itemDetail.itemUrl = itemData.itemUrl;
                itemDetail.target = itemData.target;
            }
            if (isValidSortByField)
                listViewDataForSortBy.push(itemDetail);
            else
                listViewDataForCreatedOn.push(itemDetail);
        }
    },
    _getFieldType: function(type) {
        var glideObjectGr = new GlideRecord('sys_glide_object');
        glideObjectGr.addQuery('name', type);
        glideObjectGr.query();
        if (glideObjectGr.next())
            return glideObjectGr.getValue('scalar_type');
        return '';
    },
    _customSort: function(a, b) {
        var numberTypes = ['decimal', 'float', 'integer', 'longint'];
        var dateTypes = ['date', 'datetime', 'time'];
        if (a.sortOrder === 'desc') {
            var temp = a;
            a = b;
            b = temp;
        }
        if (!a.sortFieldValue)
            return -1;
        if (!b.sortFieldValue)
            return 1;
        if (dateTypes.indexOf(a.sortByType) > -1) {
            var date1, date2;
            try {
                date1 = new GlideDateTime(a.sortFieldValue);
            } catch (exception) {
                return -1;
            }
            try {
                date2 = new GlideDateTime(b.sortFieldValue);
            } catch (exception) {
                return 1;
            }
            return date1.compareTo(date2);
        } else if (numberTypes.indexOf(a.sortByType) > -1) {
            try {
                a.sortFieldValue = Number(a.sortFieldValue);
            } catch (exception) {
                return -1;
            }
            try {
                b.sortFieldValue = Number(b.sortFieldValue);
            } catch (exception) {
                return 1;
            }
        } else {
            a.sortFieldValue = a.sortFieldValue.toLowerCase();
            b.sortFieldValue = b.sortFieldValue.toLowerCase();
        }
        if (a.sortFieldValue < b.sortFieldValue) {
            return -1;
        }
        if (a.sortFieldValue > b.sortFieldValue) {
            return 1;
        }
        return 0;
    },
    /**
     * to fetch the primary activity list view data
     * @input: glide record of activity details
     * @input: listViewData Json
     **/
    _getPrimaryActivityAdvancedData: function(configDataGr, sortBy, sortOrder) {
        var listViewAdvancedData = [];
        if (configDataGr.getValue('card_mapping_script')) {
            var vars = {
                'recordsLimit': this.recordLimit
            };
            var evaluator = new GlideScopedEvaluator();
            var data = evaluator.evaluateScript(configDataGr, 'card_mapping_script', vars);
            if (!data || (data.length === 0))
                return;
            var gr = new GlideRecord(configDataGr.getValue('table'));
            var sortByType = gr.isValidField(sortBy) ? this._getFieldType(gr.getElement(sortBy).getED().getInternalType()) : 'string';
            var index = 0;
            while (index < data.length && index < this.recordLimit) {
                var activityObj = data[index];
                if (this._isValidActivityObject(activityObj)) {
                    if (activityObj.sortFieldValue) {
                        activityObj.sortOrder = sortOrder;
                        activityObj.sortByType = sortByType;
                    }
                    listViewAdvancedData.push(activityObj);
                    index = index + 1;
                }
            }
        }
        return listViewAdvancedData;
    },
    /*
     * Validate json coming from Advanced configuration
     */
    _isValidActivityObject: function(activityObj) {
        if (activityObj.hasOwnProperty('badge') || activityObj.hasOwnProperty('badgeColor') || activityObj.hasOwnProperty('image') || activityObj.hasOwnProperty('title') || activityObj.hasOwnProperty('description') || activityObj.hasOwnProperty('field1Label') || activityObj.hasOwnProperty('field1Value') || activityObj.hasOwnProperty('field2Label') || activityObj.hasOwnProperty('field2Value')) {
            return true;
        }
        return false;
    },
    /*
     * Counts total records for the given table and conditions.
     * @input: table for which the records needs to be fetched.
     * @input: conditions that need to be appplied on the table.
     * @input: record count that will be fetched in each iteration
     * @output: returns the total count of records.
     */
    _getItemRecordsCount: function(configDataGr, itemSummaryCount, windowCount, dataGr) {
        windowCount = windowCount || this.WINDOW_SIZE;
        var start = 0;
        var itemCount = 0;
        var flag = true;
        while(flag) {
            var recordCount = 0;
            dataGr.chooseWindow(start, start+windowCount);
            dataGr.setNoCount();
            dataGr.query();

            while (dataGr.next() && itemSummaryCount + itemCount < this.ITEM_SUMMARY_COUNT_LIMIT) {
                recordCount++;
                if (dataGr.canRead()) {
                    itemCount++;
                }
            }

            if(itemSummaryCount + itemCount >= this.ITEM_SUMMARY_COUNT_LIMIT) {
                return itemCount;
            }

            if(recordCount < windowCount) {
                flag = false;
            }
            start = start + windowCount;
        }

        return itemCount;
    },
    /*
     * Gets the open tasks count.
     * @output: returns the count of total open tasks .
     */
    getTasksCount: function() {
        var session = gs.getSession();
	var taskCountFromSessionCache = session.getClientData('todo_count');
	if (taskCountFromSessionCache) {
	    // Clearing the cached data to avoid stale data
	    session.putClientData('todo_count', null);
	    return taskCountFromSessionCache;
	}
		
        var taskCount = new sn_hr_sp.todoPageUtils().getOpenTodoCount(this.ITEM_SUMMARY_COUNT_LIMIT);
        return taskCount;
    },
    /*
     * Gets the list view for Tasks
     * @input: limit, how many records to fetch
     */
    getMyTodos: function(limit) {
        var listViewData = new sn_hr_sp.todoPageUtils().getMyOpenTodos(limit);
        return listViewData;
    },
    /*
     * Gets the open requests count.
     * @output: returns the count of total open requests .
     */
    getRequestsCount: function() {
        var reqCount = 0;
        var ids = [];
        var taskGr;
        var myReqConfigList = this._getMyRequestQueryInfo();
        /* Fixed as part of defect # DEF0279027
		for (var i = 0; i < myReqConfigList.length; i++) {
            var myReqConfigRecord = myReqConfigList[i];

            var reqIds = this._getMyReqRecQuery(myReqConfigRecord, false);
            ids = reqIds.length > 0 ? ids.concat(reqIds) : ids;
            if (ids.length >= this.ITEM_SUMMARY_COUNT_LIMIT) {
                taskGr = new GlideRecordSecure('task');
                taskGr.addActiveQuery();
                taskGr.addQuery('sys_id', ids);
                taskGr.query();
                reqCount = taskGr.getRowCount();
            }
            if (reqCount >= this.ITEM_SUMMARY_COUNT_LIMIT) {
                break;
            }
        }
        if (reqCount === 0 && ids.length > 0) {
            taskGr = new GlideRecordSecure('task');
            taskGr.addActiveQuery();
            taskGr.addQuery('sys_id', ids);
            taskGr.query();
            reqCount = taskGr.getRowCount();
        }*/
        for (var i = 0; i < myReqConfigList.length && reqCount < this.ITEM_SUMMARY_COUNT_LIMIT; i++) {
            var myReqConfigRecord = myReqConfigList[i];
            var start = 0;
            var flag = true;
            var reqQuery = this._getMyReqRecQuery(myReqConfigRecord, true);
            while(flag) {
                var recordCount = 0;
                reqQuery.chooseWindow(start, start+ this.WINDOW_SIZE);
                reqQuery.setNoCount();
                reqQuery.query();
                while (reqQuery.next() && reqCount < this.ITEM_SUMMARY_COUNT_LIMIT) {
                    recordCount++;
                    if (reqQuery.canRead()) {
                        reqCount++;
                    }
                }

                if(reqCount >= this.ITEM_SUMMARY_COUNT_LIMIT)
                    return reqCount;
                if(recordCount < this.WINDOW_SIZE)
                    flag = false;
                start = start + this.WINDOW_SIZE;
            }
        }
        return reqCount;
    },
    /*
     * Gets request filter query details
     * @output: returns the dictionary of requests with details.
     */
    _getMyRequestQueryInfo: function() {
        var myReqConfigList = [];
        var cacheKey = 'requestFilter';
        var requestFiltersFromCache = sn_scoped_cache.ScopedCacheManager.get(this.EMPLOYEE_CENTER_CACHE, cacheKey);
        if (requestFiltersFromCache) {
            myReqConfigList = JSON.parse(requestFiltersFromCache)[cacheKey];
        } else {
            var rq_filter = new GlideRecord('request_filter');
            rq_filter.addActiveQuery();
            if (rq_filter.isValidField('applies_to'))
                rq_filter.addQuery('applies_to', 1).addOrCondition('applies_to', 10);
            rq_filter.query();
            while (rq_filter.next()) {
                var title = rq_filter.title.toString();
                if (title.toLowerCase().indexOf('closed') == -1) {
                    var myReqConfigRecord = {};
                    myReqConfigRecord.table = rq_filter.table_name.toString();
                    if (rq_filter.isValidField('table')) {
                        myReqConfigRecord.table = rq_filter.table.toString();
                    }
                    myReqConfigRecord.filter = rq_filter.filter.toString();
                    myReqConfigRecord.page = rq_filter.portal_page.nil() ? '' : rq_filter.portal_page.getDisplayValue() + '';
                    myReqConfigRecord.primary_display = rq_filter.primary_display.nil() ? '' : rq_filter.primary_display.getDisplayValue() + '';
                    myReqConfigRecord.secondary_displays = rq_filter.secondary_display.nil() ? '' : rq_filter.secondary_display.getDisplayValue() + '';
                    myReqConfigList.push(myReqConfigRecord);
                }
            }
            var requestFiltersToBeCached = {};
            requestFiltersToBeCached[cacheKey] = myReqConfigList;
            sn_scoped_cache.ScopedCacheManager.put(this.EMPLOYEE_CENTER_CACHE, cacheKey, JSON.stringify(requestFiltersToBeCached));
        }
        return myReqConfigList;
    },
    /*
     * Gets request filter record's detail
     * @output: returns request record's sysids and details.
     */
    _getMyReqRecQuery: function(reqConfigRecord, isCountNeeded) {
        var ids = [];
        var gr;
        var tableName = reqConfigRecord.table;
        gr = new GlideRecord(tableName);
        gr.addEncodedQuery(reqConfigRecord.filter, false);
        gr.addQuery('active', '=', true);
        if (isCountNeeded)
            return gr;
        gr.query();
        while (gr.next()) {
            ids.push(gr.sys_id + '');
        }
        return ids;
    },
    /*
     * Gets the sysid's for all the requests
     */
    _getMyRequestSysIds: function() {
        var ids = {};
        var myReqConfigList = this._getMyRequestQueryInfo();
        for (var i = 0; i < myReqConfigList.length; i++) {
            var myReqConfigRecord = myReqConfigList[i];
            var gr = new GlideRecord(myReqConfigRecord.table);
            gr.addEncodedQuery(myReqConfigRecord.filter, false);
            gr.query();
            while (gr.next()) {
                var portalSettings = {};
                portalSettings.page = myReqConfigRecord.page;
                portalSettings.primary_display = myReqConfigRecord.primary_display;
                portalSettings.secondary_displays = myReqConfigRecord.secondary_displays;
                ids[gr.sys_id + ''] = portalSettings;
            }
        }
        return ids;
    },
    /* Gets the display value for the given field
     * @input: glide record
     * @input: field name
     * @output: display value
     */
    getFieldDisplayValue: function(gr, name) {
        var id = gr.getUniqueValue();
        gr = new GlideRecord(gr.getRecordClassName());
        if (gr.get(id))
            return gr.getDisplayValue(name);
        else
            return "";
    },
    /* Gets the label for the given field
     * @input: glide record
     * @input: field name
     * @output: label
     */
    getFieldLabel: function(gr, name) {
        gr = new GlideRecord(gr.getRecordClassName());
        return gr.getElement(name).getLabel();
    },
    /*
     * Gets the list view data
     * @input: glide record for requests
     * @input: JSON containing card mapping field labels
     * @input: @input: limit, how many records to fetch
     * @output JSON cantaining card mapping values
     */
    _getRequestListViewData: function(gr, myRequestMap, limit) {
        var ids = [];
        var recordIdx = 0;
        while (gr.next() && recordIdx < limit) {
            var requestBadgeColor = "#CBE9FC";
            var reqConfigRecord = myRequestMap[gr.sys_id];
            var portalSettings = {};
            var page = reqConfigRecord.page;
            var primary_display = reqConfigRecord.primary_display;
            var secondary_display = reqConfigRecord.secondary_displays;
            if (gr.getRecordClassName() == 'sc_request') {
                var ritm = new GlideRecord("sc_req_item");
                ritm.addQuery("request", gr.getUniqueValue());
                ritm.query();
                if (ritm.getRowCount() == 0)
                    continue;
                if (ritm.getRowCount() > 1)
                    portalSettings.title = (gs.getMessage("{0} requested items", ritm.getRowCount()));
                else {
                    ritm.next();
                    portalSettings.title = (ritm.cat_item.getDisplayValue() || ritm.getDisplayValue("short_description"));
                }
                page = page ? page : 'sc_request';
                portalSettings.itemUrl = "?id=" + page + "&table=sc_request&sys_id=" + gr.getUniqueValue();
            } else {
                portalSettings.title = (primary_display ? this.getFieldDisplayValue(gr, primary_display) : this.getFieldDisplayValue(gr, 'number'));
                page = page ? page : 'ticket';
                portalSettings.itemUrl = "?id=" + page + "&table=" + gr.getRecordClassName() + "&sys_id=" + gr.getUniqueValue();
            }
            if (secondary_display) {
                var secondaryFields = secondary_display.split(",");
                portalSettings.description = secondaryFields[0] ? this.getFieldDisplayValue(gr, secondaryFields[0]) : "";
                portalSettings.field1Label = secondaryFields[1] ? this.getFieldLabel(gr, secondaryFields[1]) : "";
                portalSettings.field1Value = secondaryFields[1] ? this.getFieldDisplayValue(gr, secondaryFields[1]) : "";
                portalSettings.field2Label = secondaryFields[2] ? this.getFieldLabel(gr, secondaryFields[2]) : "";
                portalSettings.field2Value = secondaryFields[2] ? this.getFieldDisplayValue(gr, secondaryFields[2]) : "";
            } else
                portalSettings.description = (this.getFieldDisplayValue(gr, 'short_description'));
            portalSettings.badge = this.getFieldDisplayValue(gr, 'state');
            portalSettings.badgeTextColor = "#181A1F";
            portalSettings.updated_on = gr.getValue('sys_updated_on');
            portalSettings.badgeColor = requestBadgeColor;
            portalSettings.target = "";
            if (this._isValidActivityObject(portalSettings)) {
                ids.push(portalSettings);
                recordIdx++;
            }
        }
        return ids;
    },
    /*
     * Gets the list view for Requests
     * @input: limit, how many records to fetch
     */
    getRequestsData: function(limit) {
        var myRequestMap = this._getMyRequestSysIds();
        var taskIDs = Object.keys(myRequestMap);
        var gr = new GlideRecordSecure('task');
        gr.addQuery('sys_id', taskIDs);
        gr.addActiveQuery();
        gr.orderByDesc('sys_updated_on');
        gr.query();
        return this._getRequestListViewData(gr, myRequestMap, limit);
    },
    /*
     * validates whether activity can be primary or not
     * @input: sys_id, activity configuration
     * @output boolean
     */
    isValidPrimaryActivity: function(recordSysID) {
        var gr = new GlideRecord("sn_ex_sp_activity_config_detail");
        gr.addQuery("activity_configuration", recordSysID);
        gr.addEncodedQuery('activity_configuration=' + recordSysID + '^list_view_mapping=BASIC');
        gr.query();
        while (gr.next()) {
            if (!gr.title)
                return false;
        }
        return true;

    },
    // returns the field display value
    _getFormattedFieldValue: function(gr, column) {
        var colElement = gr.getElement(column);
        var colType = colElement.getED().getInternalType();
        var displayValue = colElement.getDisplayValue();
        if ((colType === 'currency' || colType === 'price') && displayValue) {
            return this._getFormattedData(displayValue, colElement);
        } else if (colType === 'translated_html' && displayValue) {
            return $sp.stripHTML(displayValue);
        }
        return displayValue;
    },
    //returns formatted value up to two decimal places for currency and Price data type
    _getFormattedData: function(value, element) {
        var formattedValue = "";
        var valueLong = parseFloat(element).toFixed(2);
        var firstDigitIndex = value.search(/\d+/);
        if (firstDigitIndex > 0) {
            var currencyCode = value.substr(0, firstDigitIndex);
            formattedValue = '' + currencyCode + valueLong;
        } else {
            var currencyIndex = value.search((/\D*$/));
            currencyCode = value.substr(currencyIndex, value.length - 1);
            formattedValue = '' + valueLong + currencyCode;
        }
        return formattedValue;
    },

    _getActivityConfigGr: function(activityRecordSysId) {
        var gr = new GlideRecord('sn_ex_sp_activity_configuration');
        if (gr.get(activityRecordSysId)) {
            return gr;
        }
        return null;
    },

    type: 'ActivityConfigurationUtilSNC'
};
