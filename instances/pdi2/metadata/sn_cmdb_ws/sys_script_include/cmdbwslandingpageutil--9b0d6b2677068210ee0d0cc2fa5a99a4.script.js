var CMDBWsLandingPageUtil = Class.create();
CMDBWsLandingPageUtil.prototype = Object.extendsObject(CMDBWorkspaceUtil, {
    initialize: function() {
		this.impActionUtil = new sn_cmdb_ws.CMDBWSImportantActionsUtil();
	},

	populateImportantActionDailyData: function() {
		var configResult = this.impActionUtil.getImportantActionConfigs();
		var configs = [];
		if (global.JSUtil.notNil(configResult) && global.JSUtil.notNil(configResult.configs)) {
			configs = configResult.configs;
		}
		for (var i = 0; i < configs.length; i++) {
			var config = configs[i];
			if (config.runType != this.RUN_TYPE.DAILY) {
				continue;
			}
			var data = this.impActionUtil.calculateImportantActionCount(config);
			if (global.JSUtil.notNil(data)) {
				var count = data.count;
				this.updateBaseAggDataState(this.STATES.DRAFT, this.STATES.RETIRED, this.SUB_CATEGORY.IMPORTANT_ACTION, null, config.sysId);
				this.populateBaseAggData(this.SUB_CATEGORY.IMPORTANT_ACTION, '', count, this.STATES.DRAFT, '', config.sysId);
				this.updateBaseAggDataState(this.STATES.READY, this.STATES.RETIRED, this.SUB_CATEGORY.IMPORTANT_ACTION, null, config.sysId);
				this.updateBaseAggDataState(this.STATES.DRAFT, this.STATES.READY, this.SUB_CATEGORY.IMPORTANT_ACTION, null, config.sysId);
			}
		}
	},

	populateTotalCI: function() {
		var totalCIs = this.getRowCount(this.TABLES.CMDB_CI,null,null,false,true); 
		this.updateBaseAggDataState(this.STATES.DRAFT, this.STATES.RETIRED, this.SUB_CATEGORY.TOTAL_CI);
		this.populateBaseAggData(this.SUB_CATEGORY.TOTAL_CI, '', totalCIs, this.STATES.DRAFT);
		this.updateBaseAggDataState(this.STATES.READY, this.STATES.RETIRED, this.SUB_CATEGORY.TOTAL_CI);
		this.updateBaseAggDataState(this.STATES.DRAFT, this.STATES.READY, this.SUB_CATEGORY.TOTAL_CI);
	},

	getMyWorkTaskFilter: function() {
		var WS = new CMDBWsConstants();
		var DM = new CMDBWsDMConstants();
		var proxy = new sn_cmdb_ws.CMDBWsDMTaskUIProxy();

		var IS_OVERDUE = DM.TASK_FILTERS.IS_OVERDUE;
		var IS_NOT_CLOSED = DM.TASK_FILTERS.IS_NOT_CLOSED;

		var filter = proxy.getTaskAssignmentFilterQuery() + WS.OPERATORS.AND + IS_NOT_CLOSED;
		var overdueFilter = filter + WS.OPERATORS.AND + IS_OVERDUE;

		return {
			open_task_filter: filter,
			overdue_task_filter: overdueFilter
		};
	},

	getMyWorkTaskCount: function(manualRefresh) {
		var MY_WORK_TRANSFORM_BROKER_ID = '7bb458a477051110ee0d0cc2fa5a99f1';
		var DM = new CMDBWsDMConstants();
			
		var result = {
			open_task_count: 0,
			overdue_task_count: 0
		};
		
		var session = gs.getSession();
		if (!manualRefresh) {
			var cacheCountObj = session.getClientData(MY_WORK_TRANSFORM_BROKER_ID);
			try {
				cacheCountObj = JSON.parse(cacheCountObj);
			} catch(e) {
				cacheCountObj = '';
			}
			if (global.JSUtil.notNil(cacheCountObj)) {
				result.open_task_count = cacheCountObj.open_task_count;
				result.overdue_task_count = cacheCountObj.overdue_task_count;
				var lastUpdatedTimeStamp = cacheCountObj.lastUpdatedTimeStamp;
				var lastUpdated = new GlideDateTime();
				lastUpdated.setNumericValue(lastUpdatedTimeStamp);
				var lastRefreshedText = gs.getMessage('Last update: {0}', lastUpdated.getDisplayValue());
				result.lastRefreshedText = lastRefreshedText;
				result.isSessionCache = true;
				return result;
			}
		}


		var taskFilters = this.getMyWorkTaskFilter();
		var filter = taskFilters.open_task_filter;
		var overdueFilter = taskFilters.overdue_task_filter;

		result.open_task_count = CMDBWsDMUtil.getRowCount(DM.TASK.TABLE, filter, false);
		result.overdue_task_count = CMDBWsDMUtil.getRowCount(DM.TASK.TABLE, overdueFilter, false);
		var lastUpdatedTime = new GlideDateTime();
		result.lastRefreshedText = gs.getMessage('Last update: {0}', lastUpdatedTime.getDisplayValue());
		result.isSessionCache = false;
		var cacheObj = { open_task_count: result.open_task_count, overdue_task_count: result.overdue_task_count, lastUpdatedTimeStamp: lastUpdatedTime.getNumericValue() };
		session.putClientData(MY_WORK_TRANSFORM_BROKER_ID, JSON.stringify(cacheObj));

		return result;
	},

    type: 'CMDBWsLandingPageUtil'
});
