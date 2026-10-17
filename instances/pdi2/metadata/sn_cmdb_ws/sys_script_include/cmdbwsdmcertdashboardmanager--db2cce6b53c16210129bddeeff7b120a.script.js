var CMDBWsDMCertDashboardManager = Class.create();
CMDBWsDMCertDashboardManager.prototype = Object.extendsObject(CMDBWorkspaceUtil, {
	initialize: function() {
		this.dmConst = new CMDBWsDMConstants();
		this.userAndGroupBaseCondition = this.dmConst.TASK.ASSIGNMENT_GROUP + this.OPERATORS.DYNAMIC + this.DYNAMIC_FILTERS.ONE_OF_MY_GROUPS + this.OPERATORS.OR + this.dmConst.TASK.ASSIGNMENT_GROUP + '.' + this.dmConst.SYS_DICTIONARY.MANAGER + this.OPERATORS.DYNAMIC + this.DYNAMIC_FILTERS.ME + this.OPERATORS.OR + this.dmConst.TASK.ASSIGNED_TO + this.OPERATORS.DYNAMIC + this.DYNAMIC_FILTERS.ME + this.OPERATORS.OR + this.dmConst.TASK.ASSIGNED_TO + '.' + this.dmConst.SYS_DICTIONARY.MANAGER + this.OPERATORS.DYNAMIC + this.DYNAMIC_FILTERS.ME;

		this.filterFieldToTableMap = {};
		this.filterFieldToTableMap[this.dmConst.POLICY_EXECUTION.INSTANCE_STATE] = this.dmConst.POLICY_EXECUTION.TABLE;
		this.filterFieldToTableMap[this.dmConst.POLICY_EXECUTION.POLICY + '_' + this.dmConst.POLICY.NAME] = this.dmConst.POLICY_EXECUTION.TABLE;
		this.filterFieldToTableMap[this.dmConst.TASK.ASSIGNMENT_GROUP] = this.dmConst.TASK.TABLE;
		this.filterFieldToTableMap[this.dmConst.TASK.ASSIGNED_TO] = this.dmConst.TASK.TABLE;
	},

	getCertInstanceAggData: function(filters, sortByField, isDesc, lastRowIdentifier, lastRowSysId, pageSize) {
		return CMDBWsDMUtil.execute.call(this, this.dmConst.ACTIONS.DM_CERT_DASHBOARD_INSTANCE_AGGREGATE, this._getCertInstanceAggData, filters, sortByField, isDesc, lastRowIdentifier, lastRowSysId, pageSize);
	},

	_getCertInstanceAggData: function(filters, sortByField, isDesc, lastRowIdentifier, lastRowSysId, pageSize) {
		// Cache mode in case we want to enable it in future
		/*if (this._parseTaskFilter(filters).isActiveInstanceFilter) {
			var cacheSize = this.getSystemProperty(this.SYS_PROPERTIES_NAME.CERT_INSTANCE_CACHE_SIZE, this.DATATYPE.NUMBER, this.BATCH_DEFAULT_SIZE);
			var activeInstanceCount = -1;
			var gr = new GlideRecord(this.TABLES.SN_CMDB_WS_BASE_AGGREGATE_DATA);
			gr.addQuery(this.COLS.CHART, this.SUB_CATEGORY.ACTIVE_CERT_INSTANCE);
			gr.addQuery(this.COLS.STATE, this.STATES.READY);
			gr.query();
			if (gr.next()) {
				activeInstanceCount = this.parseNumericString(gr.getValue(this.COLS.COUNT));
			}
			if (!global.JSUtil.nil(activeInstanceCount) && activeInstanceCount >= 0 && activeInstanceCount <= cacheSize) {
				return this._getCertInstanceAggDataFull(filters, cacheSize);
			}
		}*/
		if (sortByField == this.COLS.SYS_ID) {
			sortByField = '';
		}
		return this._getCertInstanceAggDataWithoutCache(filters, sortByField, isDesc, lastRowIdentifier, lastRowSysId, pageSize);
	},

	_parseTaskFilter: function(filters) {
		var result = {};
		result.containTaskFilter = false;
		result.isActiveInstanceFilter = false;
		if (this.isNonEmptyObjectNoArray(filters)) {
			var filterFields = Object.keys(filters);
			for (var i = 0; i < filterFields.length; i++) {
				var filterField = filterFields[i];
				var filterValue = filters[filterField];
				if (this.filterFieldToTableMap[filterField] != this.dmConst.POLICY_EXECUTION.TABLE && this.isNonEmptyArray(filterValue)) {
					result.containTaskFilter = true;
				}
				if (filterField == this.dmConst.POLICY_EXECUTION.INSTANCE_STATE) {			
					if (this.isNonEmptyArray(filterValue) && filterValue.indexOf(this.dmConst.POLICY_EXECUTION.INSTANCE_STATE_OPTIONS.COMPLETED) < 0) {
						result.isActiveInstanceFilter = true;
					}
				}
			}
		}
		return result;
	},
	
	/**
	 * Get cert instances card/list details
	 * @param {Object} filters
	 * {
	 * 'instance_state': [1, 2], Array values MUST be int type
	 * 'assignment_group': ['support_group_id', 'change_group_id'],
	 * 'assigned_to': ['cmdb_user_id', 'abel_tuter_id']
	 * }
	 * @param {String} sortByField
	 * @param {Boolean} isDesc
	 * @param {Number} lastPageEndRowIndex - pass back the last end row number,
	 * this is included in previous returned result
	 * @param {Number} pageSize - How many records to return
	 *
	 * return page of cert instance agg data in JSON array according to sortBy, and pageEndRowIndex
	 */
	_getCertInstanceAggDataWithoutCache: function(filters, sortByField, isDesc, lastRowIdentifier, lastRowSysId, pageSize) {
		var result = {};
		result.lastRowSysId = lastRowSysId;
		result.lastRowIdentifier = lastRowIdentifier;
		var isDMAdmin = gs.hasRole(this.dmConst.ROLE.DATA_MANAGER_ADMIN);
		var qualifiedInstanceIds = [];
		while (qualifiedInstanceIds.length < pageSize) {
			var pageResult = this._getCertInstanceAggDataPage(sortByField, isDesc, result.lastRowIdentifier, result.lastRowSysId, pageSize, filters);
			if (!pageResult) {
				result.noCertPolicyExecutionFound = true;
				break;
			}
			var instanceIds = pageResult.instanceIds;
			if (!instanceIds || instanceIds.length <= 0) {
				break;
			}
			var filterParseResult = this._parseTaskFilter(filters);

			if (isDMAdmin && !filterParseResult.containTaskFilter) {
				for (var i = 0; i < instanceIds.length; i++) {
					result.lastRowSysId = instanceIds[i];
					result.lastRowIdentifier = pageResult.rowIdentifiers[i];
					qualifiedInstanceIds.push(instanceIds[i]);
					if (qualifiedInstanceIds.length >= pageSize) {
						break;
					}
				}
			} else {
				var ga = new GlideAggregate(this.dmConst.TASK.TABLE);
				if (this.isNonEmptyObjectNoArray(filters)) {
					var filterFields = Object.keys(filters);
					for (var i = 0; i < filterFields.length; i++) {
						var filterField = filterFields[i];
						var filterValue = filters[filterField];
						if (this.filterFieldToTableMap[filterField] != this.dmConst.POLICY_EXECUTION.TABLE && this.isNonEmptyArray(filters[filterField])) {
							ga.addQuery(filterField, filterValue);
						}
					}
				}
				ga.addQuery(this.dmConst.TASK.POLICY_EXECUTION_ID, instanceIds);
				if (!isDMAdmin) {
					ga.addEncodedQuery(this.userAndGroupBaseCondition, false);
				}
				ga.groupBy(this.dmConst.TASK.POLICY_EXECUTION_ID);
				ga.query();
				var matchedInstanceIds = {};
				while (ga.next()) {
					var matchedInstanceId = ga.getValue(this.dmConst.TASK.POLICY_EXECUTION_ID);
					matchedInstanceIds[matchedInstanceId] = true;
				}
				for (var i = 0; i < instanceIds.length; i++) {
					var instanceId = instanceIds[i];
					var rowIdentifier = pageResult.rowIdentifiers[i];
					result.lastRowSysId = instanceId;
					result.lastRowIdentifier = rowIdentifier;
					if (!matchedInstanceIds[instanceId]) {
						continue;
					}
					qualifiedInstanceIds.push(instanceId);
					if (qualifiedInstanceIds.length >= pageSize) {
						break;
					}
				}
			}
		}
		if (!qualifiedInstanceIds || qualifiedInstanceIds.length <= 0) {
			return result;
		}
		this._addCertInstanceAggDataResultListAndTimestamp(result, qualifiedInstanceIds);
		return result;
	},

	_addCertInstanceAggDataResultListAndTimestamp: function(result, qualifiedInstanceIds) {
		var instanceAggDataMap = this.getCertInstanceAggByInstanceIds(qualifiedInstanceIds);
		var instanceAggDataList = [];
		var lastUpdatedTimeStamps = [];
		for (var i = 0; i < qualifiedInstanceIds.length; i++) {
			var qualifiedInstanceId = qualifiedInstanceIds[i];
			var aggData = instanceAggDataMap[qualifiedInstanceId];
			var lastUpdatedTime = aggData.lastUpdatedTime;
			if (lastUpdatedTime) {
				lastUpdatedTimeStamps.push(lastUpdatedTime);
			}
			instanceAggDataList.push(aggData);
		}
		result.lastRefreshedTime = '';
		if (lastUpdatedTimeStamps.length > 0) {
			lastUpdatedTimeStamps.sort();
			result.lastRefreshedTime = lastUpdatedTimeStamps[lastUpdatedTimeStamps.length - 1];
		}
		result.instanceAggDataList = instanceAggDataList;
	},

	getCertInstanceAggDataTotalCount: function(filters) {
		return CMDBWsDMUtil.execute.call(this, this.dmConst.ACTIONS.DM_CERT_DASHBOARD_INSTANCE_AGGREGATE, this._getCertInstanceAggDataTotalCount, filters);
	},

	_getCertInstanceAggDataTotalCount: function(filters) {
		var totalCount = 0;
		var isDMAdmin = gs.hasRole(this.dmConst.ROLE.DATA_MANAGER_ADMIN);
		var countGa = new GlideAggregate(this.dmConst.TASK.TABLE);
		countGa.addQuery(this.dmConst.TASK.POLICY + '.' + this.dmConst.POLICY.TYPE, this.dmConst.OOB_POLICY_TYPES.CERTIFICATION.sys_id);
		countGa.addNotNullQuery(this.dmConst.TASK.POLICY_EXECUTION_ID + '.' + this.dmConst.POLICY_EXECUTION.INSTANCE_STATE);
		countGa.addNotNullQuery(this.dmConst.TASK.POLICY_EXECUTION_ID + '.' + this.dmConst.POLICY_EXECUTION.TOTAL_TASK_COUNT);
		countGa.addNotNullQuery(this.dmConst.TASK.POLICY_EXECUTION_ID + '.' + this.dmConst.POLICY_EXECUTION.COMPLETED_TASK_COUNT);
		countGa.addNotNullQuery(this.dmConst.TASK.POLICY_EXECUTION_ID + '.' + this.dmConst.POLICY_EXECUTION.UNASSIGNED_TASK_COUNT);
		if (this.isNonEmptyObjectNoArray(filters)) {
			var filterFields = Object.keys(filters);
			for (var i = 0; i < filterFields.length; i++) {
				var filterField = filterFields[i];
				var filterValue = filters[filterField];
				if (this.isNonEmpyString(filterValue) || this.isNonEmptyArray(filterValue)) {
					if (filterField == this.dmConst.POLICY_EXECUTION.INSTANCE_STATE) {
						countGa.addQuery(this.dmConst.TASK.POLICY_EXECUTION_ID + '.' + this.dmConst.POLICY_EXECUTION.INSTANCE_STATE, filterValue);
					} else if (filterField == this.dmConst.POLICY_EXECUTION.POLICY + '_' + this.dmConst.POLICY.NAME) {
						countGa.addQuery(this.dmConst.TASK.POLICY_EXECUTION_ID + '.' + this.dmConst.POLICY_EXECUTION.POLICY + '.' + this.dmConst.POLICY.NAME, this.OPERATORS.CONTAINS, filterValue);
					} else {
						countGa.addQuery(filterField, filterValue);
					}
				}
			}
		}
		if (!isDMAdmin) {
			countGa.addEncodedQuery(this.userAndGroupBaseCondition, false);
		}
		countGa.addAggregate(this.COUNT_DISTINCT_AGGREGATE, this.dmConst.TASK.POLICY_EXECUTION_ID + '.' + this.COLS.SYS_ID);
		countGa.setGroup(false);
		countGa.query();
		while (countGa.next()) {
			totalCount = this.parseNumericString(countGa.getAggregate(this.COUNT_DISTINCT_AGGREGATE, this.dmConst.TASK.POLICY_EXECUTION_ID + '.' + this.COLS.SYS_ID));
		}
		return totalCount;
	},

	_getPolicyExecutionGrForInstancePage: function(sortByField, isDesc, filters, pageSize) {
		var gr = new GlideRecord(this.dmConst.POLICY_EXECUTION.TABLE);
		gr.addQuery(this.dmConst.POLICY_EXECUTION.EXECUTION_STATE, this.dmConst.POLICY_EXECUTION.EXECUTION_STATE_OPTIONS.COMPLETED);
		gr.addQuery(this.dmConst.POLICY_EXECUTION.POLICY + '.' + this.dmConst.POLICY.TYPE, this.dmConst.OOB_POLICY_TYPES.CERTIFICATION.sys_id);
		gr.addNotNullQuery(this.dmConst.POLICY_EXECUTION.INSTANCE_STATE);
		gr.addNotNullQuery(this.dmConst.POLICY_EXECUTION.TOTAL_TASK_COUNT);
		gr.addNotNullQuery(this.dmConst.POLICY_EXECUTION.COMPLETED_TASK_COUNT);
		gr.addNotNullQuery(this.dmConst.POLICY_EXECUTION.UNASSIGNED_TASK_COUNT);
		if (this.isNonEmptyObjectNoArray(filters)) {
			var filterFields = Object.keys(filters);
			for (var i = 0; i < filterFields.length; i++) {
				var filterField = filterFields[i];
				var filterValue = filters[filterField];
				if (this.isNonEmpyString(filterValue) || this.isNonEmptyArray(filterValue)) {
					if (this.filterFieldToTableMap[filterField] == this.dmConst.POLICY_EXECUTION.TABLE) {
						if (filterField == this.dmConst.POLICY_EXECUTION.POLICY + '_' + this.dmConst.POLICY.NAME) {
							gr.addQuery(this.dmConst.POLICY_EXECUTION.POLICY + '.' + this.dmConst.POLICY.NAME, this.OPERATORS.CONTAINS, filterValue);
						} else {
							gr.addQuery(filterField, filterValue);
						}
					}
				}
			}
		}
		if (sortByField) {
			if (isDesc) {
				gr.orderByDesc(sortByField);
			} else {
				gr.orderBy(sortByField);
			}
		}
		gr.orderBy(this.COLS.SYS_ID);
		gr.setLimit(pageSize);
		return gr;
	},

	_hasCertPolicyExecution: function() {
		var gr = new GlideRecord(this.dmConst.POLICY_EXECUTION.TABLE);
		gr.addQuery(this.dmConst.POLICY_EXECUTION.EXECUTION_STATE, this.dmConst.POLICY_EXECUTION.EXECUTION_STATE_OPTIONS.COMPLETED);
		gr.addQuery(this.dmConst.POLICY_EXECUTION.POLICY + '.' + this.dmConst.POLICY.TYPE, this.dmConst.OOB_POLICY_TYPES.CERTIFICATION.sys_id);
		gr.setLimit(1);
		gr.query();
		return gr.hasNext();
	},

	_getCertInstanceAggDataPage: function(sortByField, isDesc, pageLastRowIdentifier, pageLastRowSysId, pageSize, filters) {
		var result = {};
		result.instanceIds = [];
		result.rowIdentifiers = [];
		if (sortByField && global.JSUtil.notNil(pageLastRowIdentifier) && global.JSUtil.notNil(pageLastRowSysId)) {
			var gr = this._getPolicyExecutionGrForInstancePage(sortByField, isDesc, filters, pageSize);
			gr.addQuery(sortByField, pageLastRowIdentifier);
			gr.addQuery(this.COLS.SYS_ID, this.OPERATORS.GREATER, pageLastRowSysId);
			gr.query();
			while (gr.next()) {
				result.instanceIds.push(gr.getUniqueValue());
				result.rowIdentifiers.push(pageLastRowIdentifier);
			}
			if (result.instanceIds.length >= pageSize) {
				return result;
			}
		}
		var remainingSize = pageSize - result.instanceIds.length;
		var gr = this._getPolicyExecutionGrForInstancePage(sortByField, isDesc, filters, remainingSize);
		if (sortByField && global.JSUtil.notNil(pageLastRowIdentifier)) {
			if (isDesc) {
				gr.addQuery(sortByField, this.OPERATORS.LESSTHAN, pageLastRowIdentifier);
			} else {
				gr.addQuery(sortByField, this.OPERATORS.GREATER, pageLastRowIdentifier);
			}
		} else if (global.JSUtil.notNil(pageLastRowSysId)) {
			gr.addQuery(this.COLS.SYS_ID, this.OPERATORS.GREATER, pageLastRowSysId);
		}
		gr.query();
		while (gr.next()) {
			var instanceId = gr.getUniqueValue();
			result.instanceIds.push(instanceId);
			if (sortByField) {
				if (sortByField == this.dmConst.POLICY_EXECUTION.POLICY + '.' + this.dmConst.POLICY.NAME)
					result.rowIdentifiers.push(gr[this.dmConst.POLICY_EXECUTION.POLICY].getRefRecord().getValue('name'));
				else
					result.rowIdentifiers.push(gr.getValue(sortByField));
			}
		}
		if (result.instanceIds.length <= 0 && !this._hasCertPolicyExecution()) {
			return '';
		}
		return result;
	},

	getCertInstanceAggByInstanceIds: function(instanceIds) {
		return CMDBWsDMUtil.execute.call(this, this.dmConst.ACTIONS.DM_CERT_DASHBOARD_INSTANCE_AGGREGATE, this._getCertInstanceAggByInstanceIds, instanceIds);
	},

	/**
	 * @param {Array} instanceIds
	 *
	 * result contains - instanceId, instanceNumber, policyName,
	 * totalTaskCount, completedTaskCount, openTaskCount, unassignedTaskCount,
	 * recordCount, dueDate, instanceState, startTime, lastUpdatedTime
	*/
	_getCertInstanceAggByInstanceIds: function(instanceIds) {
		var result = {};
		if (!instanceIds || instanceIds.length <= 0) {
			return result;
		}
		var gr = new GlideRecord(this.dmConst.POLICY_EXECUTION.TABLE);
		gr.addQuery(this.COLS.SYS_ID, instanceIds);
		gr.query();
		while (gr.next()) {
			var instanceId = gr.getUniqueValue();
			result[instanceId] = this._getCerInstanceAggObject(gr);
		}
		return result;
	},

	_getCerInstanceAggObject: function(gr) {
		var aggData = {};
		aggData.executionInstanceId = gr.getUniqueValue();
		aggData.instanceNumber = gr.getValue(this.dmConst.POLICY_EXECUTION.NUMBER);
		aggData.policyName = gr.getDisplayValue(this.dmConst.POLICY_EXECUTION.POLICY);
		aggData.totalTaskCount = gr.getValue(this.dmConst.POLICY_EXECUTION.TOTAL_TASK_COUNT);
		aggData.completedTaskCount = gr.getValue(this.dmConst.POLICY_EXECUTION.COMPLETED_TASK_COUNT);
		aggData.openTaskCount = gr.getValue(this.dmConst.POLICY_EXECUTION.OPEN_TASK_COUNT);
		aggData.unassignedTaskCount = gr.getValue(this.dmConst.POLICY_EXECUTION.UNASSIGNED_TASK_COUNT);
		aggData.recordCountCount = gr.getValue(this.dmConst.POLICY_EXECUTION.RECORD_COUNT);
		aggData.dueDate = gr.getDisplayValue(this.dmConst.POLICY_EXECUTION.DUE_DATE);
		aggData.startTime = gr.getDisplayValue(this.dmConst.POLICY_EXECUTION.START_TIME);
		aggData.instanceState = {label: gr.getDisplayValue(this.dmConst.POLICY_EXECUTION.INSTANCE_STATE), value: this.parseNumericString(gr.getValue(this.dmConst.POLICY_EXECUTION.INSTANCE_STATE))};
		aggData.lastUpdatedTime = gr.getDisplayValue(this.COLS.SYS_UPDATED_ON);
		aggData.percentComplete = gr.getValue(this.dmConst.POLICY_EXECUTION.PERCENT_COMPLETE);
		return aggData;
	},

	queueUpdateCertInstanceAggDataEvent: function(executionId) {
		gs.eventQueue(this.dmConst.EVENTS.CERTIFICATION_DASHBOARD_TASK_UPDATED, null, executionId);
	},

	calculateInstanceAggDataByInstanceId: function(executionId) {
		var taskGr = new GlideRecord(this.dmConst.TASK.TABLE);
		taskGr.addQuery(this.dmConst.TASK.POLICY_EXECUTION_ID, executionId);
		taskGr.addQuery(this.dmConst.TASK.POLICY + '.' + this.dmConst.POLICY.TYPE, this.dmConst.OOB_POLICY_TYPES.CERTIFICATION.sys_id);
		taskGr.setCategory(this.CMDB_WORKSPACE_DB_CATEGORY);
		taskGr.query();
		var taskRowCount = taskGr.getRowCount();
		var currentInstanceAgg = {};
		currentInstanceAgg.totalTaskCount = 0;
		currentInstanceAgg.completedTaskCount = 0;
		currentInstanceAgg.openTaskCount = 0;
		currentInstanceAgg.inProgressTaskCount = 0;
		currentInstanceAgg.unassignedTaskCount = 0;
		currentInstanceAgg.dueDate = '';
		currentInstanceAgg.instanceState = -1;
		currentInstanceAgg.isPastDue = false;
		while (taskGr.next()) {
			var taskId = taskGr.getUniqueValue();
			var instanceId = taskGr.getValue(this.dmConst.TASK.POLICY_EXECUTION_ID);
			var state = taskGr.getValue(this.dmConst.TASK.STATE);
			var assignedTo = taskGr.getValue(this.dmConst.TASK.ASSIGNED_TO);
			var assignmentGroup = taskGr.getValue(this.dmConst.TASK.ASSIGNMENT_GROUP);
			var dueDate = taskGr.getValue(this.dmConst.TASK.DUE_DATE);

			currentInstanceAgg.totalTaskCount++;
			if (!assignmentGroup && !assignedTo) {
				currentInstanceAgg.unassignedTaskCount++;
			}
			if (dueDate) {
				this._calculateInstanceAggDueDate(currentInstanceAgg, dueDate, state);
			}
			this._aggregateTaskCountByTaskState(currentInstanceAgg, state);
		}
		if (taskRowCount > 0) {
			this._updateInstanceAggResult(executionId, currentInstanceAgg);
		}
	},

	calculateActiveCertInstanceCount: function() {
		this.updateBaseAggDataState(this.STATES.DRAFT, this.STATES.RETIRED, this.SUB_CATEGORY.ACTIVE_CERT_INSTANCE);
		var ga = new GlideAggregate(this.dmConst.POLICY_EXECUTION.TABLE);
		ga.addQuery(this.dmConst.POLICY_EXECUTION.INSTANCE_STATE, this.OPERATORS.NOTEQUAL, this.dmConst.POLICY_EXECUTION.INSTANCE_STATE_OPTIONS.COMPLETED);
		ga.addQuery(this.dmConst.POLICY_EXECUTION.POLICY + '.' + this.dmConst.POLICY.TYPE, this.dmConst.OOB_POLICY_TYPES.CERTIFICATION.sys_id);
		ga.setCategory(this.CMDB_WORKSPACE_DB_CATEGORY);
		ga.addAggregate(this.COUNT_AGGREGATE);
		ga.query();
		var count = 0;
		if (ga.next()) {
			count = this.parseNumericString(ga.getAggregate(this.COUNT_AGGREGATE));
		}

		this.populateBaseAggData(this.SUB_CATEGORY.ACTIVE_CERT_INSTANCE, '', count, this.STATES.DRAFT);	
		this.updateBaseAggDataState(this.STATES.READY, this.STATES.RETIRED, this.SUB_CATEGORY.ACTIVE_CERT_INSTANCE);
		this.updateBaseAggDataState(this.STATES.DRAFT, this.STATES.READY, this.SUB_CATEGORY.ACTIVE_CERT_INSTANCE);
	},

	activateCertInstanceAggregateDataCalculationJob: function() {
		var jobCtx = this._getRuntimeAttributeJSONValue(this.SUB_CATEGORY.CERT_INSTANCE_AGGREGATE);
		if (!global.JSUtil.nil(jobCtx) && jobCtx.allBatchCompleted) {
			this._deleteRuntimeAttribute(this.SUB_CATEGORY.CERT_INSTANCE_AGGREGATE);
		}
	},

	calculateInstanceAggregateData: function(categoryId, testBatchSize, testMaxBatchExecutionTime, testDeleteJobCtx, testRuntimeThreshold, testDeleteJobCtxJson, testDataQuery) {
		var categoryDetail = this._getCategoryDetails(categoryId);
		if (!categoryDetail.active) {
			return;
		}
		var getJobCtxJsonFn = this._initializeInstanceAggregateDataCtxJson.bind(this);
		var advanceBatchFn = this._onAdvanceBatchCalculateInstanceAggregateData.bind(this);

		this._batchProcess(categoryDetail, getJobCtxJsonFn, advanceBatchFn, null, null, null, testBatchSize, testMaxBatchExecutionTime, testDeleteJobCtx, testRuntimeThreshold, testDeleteJobCtxJson, testDataQuery);
	},

	_initializeInstanceAggregateDataCtxJson: function() {
		var jobCtx = {
			lastSysId: '',
			firstSysId: '',
			lastTaskSysId: '',
			runtime: 0,
			statsId: '',
			allBatchCompleted: false,
			policyTypeId: this.dmConst.OOB_POLICY_TYPES.CERTIFICATION.sys_id,
			identifier: 'CertInstanceAggregateData',
			instanceAggMap: {}
		};
		return jobCtx;
	},

	_onAdvanceBatchCalculateInstanceAggregateData: function(jobCtx, categoryDetail) {
		var allBatchCompleted = false;
		var allTaskBatchCompleted = false;
		var batchSize = jobCtx.batchSize;

		var batchGr = new GlideRecord(this.dmConst.POLICY_EXECUTION.TABLE);
		if (jobCtx.testDataQuery) {
			batchGr.addEncodedQuery(jobCtx.testDataQuery, false);
		}
		if (jobCtx.policyTypeId) {
			batchGr.addQuery(this.dmConst.POLICY_EXECUTION.POLICY + '.' + this.dmConst.POLICY.TYPE, jobCtx.policyTypeId);
		}
		if (global.JSUtil.notNil(jobCtx.lastSysId)) {
			if (global.JSUtil.notNil(jobCtx.lastTaskSysId)) {
				batchGr.addQuery(this.COLS.SYS_ID, '>=', jobCtx.firstSysId);
			} else {
				batchGr.addQuery(this.COLS.SYS_ID, '>', jobCtx.lastSysId);
			}
		}
		batchGr.setCategory(this.CMDB_WORKSPACE_DB_CATEGORY);
		batchGr.setLimit(batchSize);
		batchGr.orderBy(this.COLS.SYS_ID);
		batchGr.query();
		var rowCount = batchGr.getRowCount();
		allBatchCompleted = rowCount < batchSize ? true : false;
		var firstSysId = '';
		var executionIds = [];
		while (batchGr.next()) {
			var executionId = batchGr.getUniqueValue();
			if (global.JSUtil.nil(firstSysId)) {
				firstSysId = executionId;
			}
			executionIds.push(executionId);
		}
		jobCtx.firstSysId = firstSysId;
		jobCtx.lastSysId = batchGr.getUniqueValue();

		if (rowCount > 0) {
			do {
				var taskBatchGr = new GlideRecord(this.dmConst.TASK.TABLE);
				if (global.JSUtil.notNil(jobCtx.lastTaskSysId)) {
					taskBatchGr.addQuery(this.COLS.SYS_ID, '>', jobCtx.lastTaskSysId);
				}
				taskBatchGr.addQuery(this.dmConst.TASK.POLICY_EXECUTION_ID, executionIds);
				taskBatchGr.setCategory(this.CMDB_WORKSPACE_DB_CATEGORY);
				taskBatchGr.setLimit(batchSize);
				taskBatchGr.orderBy(this.COLS.SYS_ID);
				taskBatchGr.query();
				var taskRowCount = taskBatchGr.getRowCount();
				allTaskBatchCompleted = taskRowCount < batchSize ? true : false;
				var taskToInstanceMap = {};
				while (taskBatchGr.next()) {
					var taskId = taskBatchGr.getUniqueValue();
					var instanceId = taskBatchGr.getValue(this.dmConst.TASK.POLICY_EXECUTION_ID);
					var state = taskBatchGr.getValue(this.dmConst.TASK.STATE);
					var assignedTo = taskBatchGr.getValue(this.dmConst.TASK.ASSIGNED_TO);
					var assignmentGroup = taskBatchGr.getValue(this.dmConst.TASK.ASSIGNMENT_GROUP);
					var dueDate = taskBatchGr.getValue(this.dmConst.TASK.DUE_DATE);
					taskToInstanceMap[taskId] = instanceId;

					var currentInstanceAgg = jobCtx.instanceAggMap[instanceId];
					if (!currentInstanceAgg) {
						jobCtx.instanceAggMap[instanceId] = {};
						currentInstanceAgg = jobCtx.instanceAggMap[instanceId];
						currentInstanceAgg.totalTaskCount = 0;
						currentInstanceAgg.completedTaskCount = 0;
						currentInstanceAgg.openTaskCount = 0;
						currentInstanceAgg.inProgressTaskCount = 0;
						currentInstanceAgg.unassignedTaskCount = 0;
						currentInstanceAgg.dueDate = '';
						currentInstanceAgg.instanceState = -1;
						currentInstanceAgg.isPastDue = false;
					}

					currentInstanceAgg.totalTaskCount++;
					if (!assignmentGroup && !assignedTo) {
						currentInstanceAgg.unassignedTask++;
					}
					if (dueDate) {
						this._calculateInstanceAggDueDate(currentInstanceAgg, dueDate, state);
					}
					this._aggregateTaskCountByTaskState(currentInstanceAgg, state);
				}
				if (taskRowCount > 0) {
					jobCtx.lastTaskSysId = taskBatchGr.getUniqueValue();
					if (this._getTimeSpent(jobCtx.startTime) >= jobCtx.maxBatchExecutionTime) {
						gs.info(jobCtx.identifier + ' inner batch max execution time exceeded.');
						return false;
					}
				}
			} while (!allTaskBatchCompleted);

			var instanceIds = Object.keys(jobCtx.instanceAggMap);
			for (var i = 0; i < instanceIds.length; i++) {
				var currentInstanceId = instanceIds[i];
				var aggData = jobCtx.instanceAggMap[currentInstanceId];
				this._updateInstanceAggResult(currentInstanceId, aggData);
			}

			jobCtx.lastTaskSysId = '';
			jobCtx.instanceAggMap = {};
		}
		gs.info('Finished workspace '+ jobCtx.identifier + ' category 1 batch. Total record processed: ' + rowCount);
		return allBatchCompleted;
	},

	_calculateInstanceAggDueDate: function(currentInstanceAgg, dueDate, state) {
		var dueDateTime = new GlideDateTime(dueDate).getNumericValue();
		var nowTime = new GlideDateTime().getNumericValue();
		var isTaskClosed = state == this.dmConst.TASK.STATE_OPTIONS.CLOSED_COMPLETE || state == this.dmConst.TASK.STATE_OPTIONS.CLOSED_INCOMPLETE || state == this.dmConst.TASK.STATE_OPTIONS.CLOSED_SKIPPED || state == this.dmConst.TASK.STATE_OPTIONS.CLOSED_CANCELLED;
		if (currentInstanceAgg.firstDueDate) {
			var currentInstanceDueDateTime = new GlideDateTime(currentInstanceAgg.firstDueDate).getNumericValue();
			if (dueDateTime < currentInstanceDueDateTime) {
				currentInstanceAgg.firstDueDate = dueDate;
			}
		} else {
			currentInstanceAgg.firstDueDate = dueDate;
		}
		if (isTaskClosed) {
			return;
		}
		// Exclude closed task
		if (dueDateTime < nowTime) {
			currentInstanceAgg.isPastDue = true;
		}
		if (currentInstanceAgg.dueDate) {
			var currentInstanceDueDateTime = new GlideDateTime(currentInstanceAgg.dueDate).getNumericValue();
			if (dueDateTime < currentInstanceDueDateTime) {
				currentInstanceAgg.dueDate = dueDate;
			}
		} else {
			currentInstanceAgg.dueDate = dueDate;
		}
	},

	_aggregateTaskCountByTaskState: function(currentInstanceAgg, state) {
		if (state == this.dmConst.TASK.STATE_OPTIONS.WORK_IN_PROGRESS) {
			currentInstanceAgg.openTaskCount++;
			currentInstanceAgg.inProgressTaskCount++;
		} else if (state == this.dmConst.TASK.STATE_OPTIONS.CLOSED_COMPLETE || state == this.dmConst.TASK.STATE_OPTIONS.CLOSED_INCOMPLETE || state == this.dmConst.TASK.STATE_OPTIONS.CLOSED_SKIPPED || state == this.dmConst.TASK.STATE_OPTIONS.CLOSED_CANCELLED) {
			currentInstanceAgg.completedTaskCount++;
		} else {
			currentInstanceAgg.openTaskCount++;
		}
	},

	_updateInstanceAggResult: function(currentInstanceId, aggData) {
		aggData.instanceState = this._determineInstanceState(aggData);
		var gr = new GlideRecord(this.dmConst.POLICY_EXECUTION.TABLE);
		if (!gr.get(currentInstanceId)) {
			return false;
		}
		gr.setValue(this.dmConst.POLICY_EXECUTION.TOTAL_TASK_COUNT, aggData.totalTaskCount);
		gr.setValue(this.dmConst.POLICY_EXECUTION.COMPLETED_TASK_COUNT, aggData.completedTaskCount);
		gr.setValue(this.dmConst.POLICY_EXECUTION.OPEN_TASK_COUNT, aggData.openTaskCount);
		gr.setValue(this.dmConst.POLICY_EXECUTION.UNASSIGNED_TASK_COUNT, aggData.unassignedTaskCount);
		gr.setValue(this.dmConst.POLICY_EXECUTION.INSTANCE_STATE, aggData.instanceState);
		if (aggData.dueDate) {
			gr.setValue(this.dmConst.POLICY_EXECUTION.DUE_DATE, aggData.dueDate);
		} else {
			gr.setValue(this.dmConst.POLICY_EXECUTION.DUE_DATE, aggData.firstDueDate);
		}
		return gr.update();
	},

	_determineInstanceState: function(aggData) {
		if (aggData.completedTaskCount >= aggData.totalTaskCount) {
			return this.dmConst.POLICY_EXECUTION.INSTANCE_STATE_OPTIONS.COMPLETED;
		} else if (aggData.isPastDue) {
			return this.dmConst.POLICY_EXECUTION.INSTANCE_STATE_OPTIONS.PAST_DUE;
		} else if (aggData.inProgressTaskCount > 0 || aggData.completedTaskCount > 0) {
			return this.dmConst.POLICY_EXECUTION.INSTANCE_STATE_OPTIONS.IN_PROGRESS;
		} else {
			return this.dmConst.POLICY_EXECUTION.INSTANCE_STATE_OPTIONS.NOT_STARTED;
		}
	},

	_shouldRecalculateInstanceAggregate: function(current, previous) {
		var dueDateChanges = current.due_date.changes();
		var stateChanges = current.state.changes();
		var operation = current.operation();
		var prevAssignmentEmpty = global.JSUtil.nil(previous.assigned_to) && global.JSUtil.nil(previous.assignment_group);
		var currentAssignmentNonEmpty = global.JSUtil.notNil(current.assigned_to) || global.JSUtil.notNil(current.assignment_group);
		var prevAssignmentNonEmpty = global.JSUtil.notNil(previous.assigned_to) || global.JSUtil.notNil(previous.assignment_group);
		var currentAssignmentEmpty = global.JSUtil.nil(current.assigned_to) && global.JSUtil.nil(current.assignment_group);
		var result = (prevAssignmentEmpty && currentAssignmentNonEmpty) || (prevAssignmentNonEmpty && currentAssignmentEmpty) || dueDateChanges || stateChanges || operation == 'delete';

		return result;
	},

    getCertInstanceTaskDetails: function(instanceId) {
        var isDMAdmin = gs.hasRole(this.dmConst.ROLE.DATA_MANAGER_ADMIN);

        let listFilter = this.dmConst.TASK.POLICY_EXECUTION_ID + '=' + instanceId;
        if (!isDMAdmin) {
            let certTasksUserAndGroupCondition = this.dmConst.TASK.ASSIGNMENT_GROUP + this.OPERATORS.DYNAMIC + this.DYNAMIC_FILTERS.ONE_OF_MY_GROUPS + this.OPERATORS.OR + this.dmConst.TASK.ASSIGNMENT_GROUP + '.' + this.dmConst.SYS_DICTIONARY.MANAGER + this.OPERATORS.DYNAMIC + this.DYNAMIC_FILTERS.ME + this.OPERATORS.OR + this.dmConst.TASK.ASSIGNED_TO + this.OPERATORS.DYNAMIC + this.DYNAMIC_FILTERS.ME + this.OPERATORS.OR + this.dmConst.TASK.ASSIGNED_TO + '.' + this.dmConst.SYS_DICTIONARY.MANAGER + this.OPERATORS.DYNAMIC + this.DYNAMIC_FILTERS.ME;
            listFilter += '^' + certTasksUserAndGroupCondition;
        }
		
        return {
            listFilter: listFilter
        };
    },

	getCertRecordsListDetails: function(instanceId) {
		var result = {};
		var isDMAdmin = gs.hasRole(this.dmConst.ROLE.DATA_MANAGER_ADMIN);
		var contextGr = new GlideRecord(this.dmConst.TASK_EXECUTION_CONTEXT.TABLE);
		contextGr.addQuery(this.dmConst.TASK_EXECUTION_CONTEXT.TASK + "." + this.dmConst.TASK.POLICY_EXECUTION_ID, instanceId);
		contextGr.setLimit(1);
		contextGr.query();
		if (contextGr.next()) {
			var context = JSON.parse(contextGr.getValue(this.dmConst.TASK_EXECUTION_CONTEXT.CONTEXT));
			result.listTable = context.hasOwnProperty(this.dmConst.POLICY.TABLE_COL) ? context.table : this.dmConst.DEFAULT_POLICY_TABLE;
			result.displayFields = context.hasOwnProperty("displayFields") ? context.displayFields : null;
			result.certificationFields = context.hasOwnProperty("certificationFields") ? context.certificationFields : null;
			let listFilter = 'RLQUERY' + this.dmConst.CERTIFICATION_TASK_TO_DOCUMENT.TABLE + '.' + this.dmConst.CERTIFICATION_TASK_TO_DOCUMENT.CI + ',>=1^' + this.dmConst.CERTIFICATION_TASK_TO_DOCUMENT.TASK + '.' + this.dmConst.TASK.POLICY_EXECUTION_ID + '=' + instanceId;
			if(!isDMAdmin) {
				let certRecordsUserAndGroupCondition = this.dmConst.CERTIFICATION_TASK_TO_DOCUMENT.TASK + '.' + this.dmConst.TASK.ASSIGNMENT_GROUP + this.OPERATORS.DYNAMIC + this.DYNAMIC_FILTERS.ONE_OF_MY_GROUPS + this.OPERATORS.OR + this.dmConst.CERTIFICATION_TASK_TO_DOCUMENT.TASK + '.' + this.dmConst.TASK.ASSIGNMENT_GROUP + '.' + this.dmConst.SYS_DICTIONARY.MANAGER + this.OPERATORS.DYNAMIC + this.DYNAMIC_FILTERS.ME + this.OPERATORS.OR + this.dmConst.CERTIFICATION_TASK_TO_DOCUMENT.TASK + '.' + this.dmConst.TASK.ASSIGNED_TO + this.OPERATORS.DYNAMIC + this.DYNAMIC_FILTERS.ME + this.OPERATORS.OR + this.dmConst.CERTIFICATION_TASK_TO_DOCUMENT.TASK + '.' + this.dmConst.TASK.ASSIGNED_TO + '.' + this.dmConst.SYS_DICTIONARY.MANAGER + this.OPERATORS.DYNAMIC + this.DYNAMIC_FILTERS.ME;
				listFilter += '^' + certRecordsUserAndGroupCondition;
			}
			result.listFilter = listFilter;
		}
		return result;
	},

	/**
	 * Gets the task to document records for given cert instance and document sys_ids
	 * @param {String} instanceId
	 * @param {String[]} documentIds
	 * @returns {GlideRecord}
	 * */
	getCertTaskToDocumentForCertInstance: function(instanceId, documentIds) {
		var gr = new GlideRecord(this.dmConst.CERTIFICATION_TASK_TO_DOCUMENT.TABLE);
		gr.addQuery(this.dmConst.TASK.TABLE + "." + this.dmConst.TASK.POLICY_EXECUTION_ID, instanceId);
		if (documentIds && documentIds.length > 0) {
			gr.addQuery(this.dmConst.CERTIFICATION_TASK_TO_DOCUMENT.CI, this.dmConst.QUERY_FILTERS.IN, documentIds.join());
		}
		gr.query();

		if (!gr.hasNext())
			throw new CMDBWsError({
				code: this.dmConst.ERROR_CODES.DM_INVALID_RECORD,
				message: sn_i18n.Message.getMessage("sn_cmdb_ws", "Certification instance ({0}) does not have any associated certification records.", {
					0: instanceId
				}),
				action: this.dmConst.ACTIONS.DM_GET_CERT_TASK,
				source: this.dmConst.DM_ERROR_SOURCE,
				details: "Certification instance (" + instanceId + ") does not have any task to document records for given document sys_ids - " + documentIds.join(),
				logError: false
			});
		return gr;
	},

	calculateAgingTaskByUserAndGroup: function() {
		var getBuckets = CMDBWsDMUtil.createAgingTasksBuckets(3);
		this.updateBaseAggDataState(this.STATES.DRAFT, this.STATES.RETIRED, this.SUB_CATEGORY.CERT_DASHBAORD_AGING_TASK);

		var ga = new GlideAggregate(this.TABLES.CMDB_DATA_MANAGEMENT_TASK);
		ga.addQuery(this.dmConst.TASK.POLICY + '.' + this.dmConst.POLICY.TYPE, this.dmConst.OOB_POLICY_TYPES.CERTIFICATION.sys_id);
		ga.groupBy(this.dmConst.TASK.ASSIGNMENT_GROUP);
		ga.groupBy(this.dmConst.TASK.ASSIGNED_TO);
		ga.query();
		while (ga.next()) {
			var userGroup = ga.getValue(this.dmConst.TASK.ASSIGNMENT_GROUP);
			var user = ga.getValue(this.dmConst.TASK.ASSIGNED_TO);
			this._populateTaskAggByBucket(getBuckets, user, userGroup);
		}

		this.updateBaseAggDataState(this.STATES.READY, this.STATES.RETIRED, this.SUB_CATEGORY.CERT_DASHBAORD_AGING_TASK);
		this.updateBaseAggDataState(this.STATES.DRAFT, this.STATES.READY, this.SUB_CATEGORY.CERT_DASHBAORD_AGING_TASK);
	},

	_populateTaskAggByBucket: function(getBuckets, user, userGroup) {
		var policyTypes = {};
		var groupBy = this.COLS.POLICY_ID + this.COLS.DOT + this.COLS.CMDB_POLICY_TYPE;
		for (var i = 0; i < getBuckets.length; i++) {
			var bucket = getBuckets[i];
			var ga = new GlideAggregate(this.TABLES.CMDB_DATA_MANAGEMENT_TASK);
			ga.addQuery(this.dmConst.TASK.POLICY + '.' + this.dmConst.POLICY.TYPE, this.dmConst.OOB_POLICY_TYPES.CERTIFICATION.sys_id);
			ga.addEncodedQuery(bucket.condition, true);
			if (user) {
				ga.addQuery(this.dmConst.TASK.ASSIGNED_TO, user);
			} else {
				ga.addNullQuery(this.dmConst.TASK.ASSIGNED_TO);
			}
			if (userGroup) {
				ga.addQuery(this.dmConst.TASK.ASSIGNMENT_GROUP, userGroup);
			} else {
				ga.addNullQuery(this.dmConst.TASK.ASSIGNMENT_GROUP);
			}
			ga.groupBy(groupBy);
			ga.addAggregate(this.COLS.COUNT);
			ga.query();
			while (ga.next()) {
				var policyType = this.dmConst.OOB_POLICY_TYPE_TO_CHOICE[ga.getValue(groupBy)];
				var count = ga.getAggregate(this.COLS.COUNT);
				var policyTypeObj = {
					label: bucket.label,
					count: count
				};
				if (global.JSUtil.nil(policyTypes[policyType]))
					policyTypes[policyType] = [];

				policyTypes[policyType].push(policyTypeObj);
			}
		}

		for (policyType in policyTypes) {
			var currTypeData = policyTypes[policyType];
			for (i = 0; i < currTypeData.length; i++) {
				var currObj = currTypeData[i];
				this._populateAgingTaskAggData(this.SUB_CATEGORY.CERT_DASHBAORD_AGING_TASK, policyType, currObj.count, this.STATES.DRAFT, currObj.label, user, userGroup);
			}
		}
	},

	_populateAgingTaskAggData: function(chart, groupby, count, state, dynamicGroupby, user, userGroup) {
		var gr = new GlideRecord(this.TABLES.SN_CMDB_WS_WORKLOAD_AGG_DATA);
		gr.initialize();
		gr.setValue(this.COLS.CHART, chart);
		if (groupby) {
			gr.setValue(this.COLS.GROUP_BY, groupby);
		}
		if (dynamicGroupby) {
			gr.setValue(this.COLS.DYNAMIC_GROUP_BY, dynamicGroupby);
		}
		if (user) {
			gr.setValue(this.COLS.USER, user);
		}
		if (userGroup) {
			gr.setValue(this.COLS.USER_GROUP, userGroup);
		}
		gr.setValue(this.COLS.COUNT, count);
		gr.setValue(this.COLS.STATE, state);
		gr.insert();
	},

	updateCertTaskToDocRecords: function() {
		var gr = new GlideRecord(this.dmConst.CERTIFICATION_TASK_TO_DOCUMENT.TABLE);
		gr.addEncodedQuery(this.dmConst.TASK.TABLE + '.' + this.dmConst.TASK.POLICY_EXECUTION_ID + '.' + this.dmConst.POLICY_EXECUTION.NUMBER + this.OPERATORS.ISNOTEMPTY + this.OPERATORS.AND + this.dmConst.CERTIFICATION_TASK_TO_DOCUMENT.STATUS + this.OPERATORS.EQUAL + this.dmConst.CERTIFICATION_TASK_TO_DOCUMENT.STATUS_OPTIONS.CERTIFIED, false);
		gr.query();
		gr.setValue(this.dmConst.CERTIFICATION_TASK_TO_DOCUMENT.CONTAINS_CERTIFIED_ATTRIBUTES, true);
		gr.updateMultiple();

		gr = new GlideRecord(this.dmConst.CERTIFICATION_TASK_TO_DOCUMENT.TABLE);
		gr.addEncodedQuery(this.dmConst.TASK.TABLE + '.' + this.dmConst.TASK.POLICY_EXECUTION_ID + '.' + this.dmConst.POLICY_EXECUTION.NUMBER + this.OPERATORS.ISNOTEMPTY + this.OPERATORS.AND + this.dmConst.CERTIFICATION_TASK_TO_DOCUMENT.STATUS + this.OPERATORS.EQUAL + this.dmConst.CERTIFICATION_TASK_TO_DOCUMENT.STATUS_OPTIONS.PENDING + this.OPERATORS.OR + this.dmConst.CERTIFICATION_TASK_TO_DOCUMENT.STATUS + this.OPERATORS.EQUAL + this.dmConst.CERTIFICATION_TASK_TO_DOCUMENT.STATUS_OPTIONS.FAILED, false);
		gr.query();
		while (gr.next()) {
			var _contains_failed_attributes = false;
			var _contains_certified_attributes = false;
			var attrStatus = gr.getValue(this.dmConst.CERTIFICATION_TASK_TO_DOCUMENT.ATTRIBUTE_STATUS);
			var attributeStatusObj = "";
			try {
				attributeStatusObj = JSON.parse(attrStatus);
			} catch(e) {
				attributeStatusObj = "";
			}
			if (attributeStatusObj != "") {
				var attributes = Object.keys(attributeStatusObj);
				for (var i = 0; i < attributes.length; i++) {
					if (_contains_failed_attributes && _contains_certified_attributes) {
						break;
					}

					var attribute = attributes[i];
					var attributeStatus = attributeStatusObj[attribute];
					if (attributeStatus.status == this.dmConst.CERTIFICATION_TASK_TO_DOCUMENT.STATUS_OPTIONS.FAILED && !_contains_failed_attributes) {
						_contains_failed_attributes = true;
					}
					if (attributeStatus.status == this.dmConst.CERTIFICATION_TASK_TO_DOCUMENT.STATUS_OPTIONS.CERTIFIED && !_contains_certified_attributes) {
						_contains_certified_attributes = true;
					}
				}
				gr.setValue(this.dmConst.CERTIFICATION_TASK_TO_DOCUMENT.CONTAINS_CERTIFIED_ATTRIBUTES, _contains_certified_attributes);
				gr.setValue(this.dmConst.CERTIFICATION_TASK_TO_DOCUMENT.CONTAINS_FAILED_ATTRIBUTES, _contains_failed_attributes);
				gr.update();
			}
		}
	},

	queueUpdateCertTaskToDocRecordsEvent: function() {
		gs.eventQueue(this.dmConst.EVENTS.CERTIFICATION_DASHBOARD_CERT_TASK_TO_DOC_UPDATE, null, null);
	},

	_getCertInstanceAggDataFull: function(filters, cacheSize) {
		var result = {};
		var isDMAdmin = gs.hasRole(this.dmConst.ROLE.DATA_MANAGER_ADMIN);
		var instanceIdToInstanceStateMap = this._getCertInstanceAggDataPage('', '', 0, cacheSize, filters);
		if (!instanceIdToInstanceStateMap) {
			result.noCertPolicyExecutionFound = true;
			return result;
		}
		var instanceIds = Object.keys(instanceIdToInstanceStateMap);
		if (!instanceIds || instanceIds.length <= 0) {
			return result;
		}
		result.useCacheMode = true;
		var instanceAggDataList = [];
		var qualifiedInstanceIds = [];
		if (!isDMAdmin) {
			var matchedInstanceIds = {};
			var ga = new GlideAggregate(this.dmConst.TASK.TABLE);
			ga.addQuery(this.dmConst.TASK.POLICY_EXECUTION_ID, instanceIds);
			ga.addEncodedQuery(this.userAndGroupBaseCondition, false);
			ga.groupBy(this.dmConst.TASK.POLICY_EXECUTION_ID);
			ga.query();
			while (ga.next()) {
				var matchedInstanceId = ga.getValue(this.dmConst.TASK.POLICY_EXECUTION_ID);
				matchedInstanceIds[matchedInstanceId] = true;
			}
			for (var i = 0; i < instanceIds.length; i++) {
				var instanceId = instanceIds[i];
				if (!matchedInstanceIds[instanceId]) {
					continue;
				}
				qualifiedInstanceIds.push(instanceId);
			}
		} else {
			for (var i = 0; i < instanceIds.length; i++) {
				qualifiedInstanceIds.push(instanceIds[i]);
			}
		}
		if (!qualifiedInstanceIds || qualifiedInstanceIds.length <= 0) {
			return result;
		}
		this._addCertInstanceAggDataResultListAndTimestamp(result, qualifiedInstanceIds);
		return result;
	},

	type: 'CMDBWsDMCertDashboardManager'
});
