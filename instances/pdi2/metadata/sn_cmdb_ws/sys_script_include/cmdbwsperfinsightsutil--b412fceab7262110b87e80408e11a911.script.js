var CMDBWsPerfInsightsUtil = Class.create();
CMDBWsPerfInsightsUtil.prototype = Object.extendsObject(CMDBWorkspaceUtil, {
    initialize: function() {},

    INTEGRATIONS_OUTLIER_LOOKBACK_DAYS: 30,
    INTEGRATION_EXECUTION_TERMINAL_STATE_ENC_QUERY: "stateINcomplete,error",

    populatePerfInsightsAggregates: function() {
        this._populateCMDBRelatedEntryAggregates();
        this._populateRelationshipMissingParentOrChild();
        this._populatePartialPayloadMetrics();
        this._populateDuplicateAndStaleAggregates();
        this._processIntegrationOutliers();
    },

    _populatePartialPayloadItemAggregates: function() {
        this.updateBaseAggDataState(this.STATES.DRAFT, this.STATES.RETIRED, this.SUB_CATEGORY.PARTIAL_PAYLOAD_ITEM);

		var jobCtx = this._getRuntimeAttributeJSONValue(this.SUB_CATEGORY.PARTIAL_PAYLOAD_ITEM);
		if (global.JSUtil.nil(jobCtx) || global.JSUtil.nil(jobCtx.sourceAggregate) || !jobCtx.allBatchCompleted) {
			return;
		}
		var sourceAggregate = jobCtx.sourceAggregate;
		var sources = Object.keys(sourceAggregate);
		for (var i = 0; i < sources.length; i++) {
			var source = sources[i];
			var count = sourceAggregate[source];
			this.populateBaseAggData(this.SUB_CATEGORY.PARTIAL_PAYLOAD_ITEM, null, count, this.STATES.DRAFT, '', source);
		}

        // Update the existing records in "Ready" state to "Retired"
        this.updateBaseAggDataState(this.STATES.READY, this.STATES.RETIRED, this.SUB_CATEGORY.PARTIAL_PAYLOAD_ITEM);
        // Update the existing records in "Draft" state to "Ready"
        this.updateBaseAggDataState(this.STATES.DRAFT, this.STATES.READY, this.SUB_CATEGORY.PARTIAL_PAYLOAD_ITEM);
    },

    _populateTotalPartialPayload: function() {
        this.updateBaseAggDataState(this.STATES.DRAFT, this.STATES.RETIRED, this.SUB_CATEGORY.TOTAL_PARTIAL_PAYLOADS);

        var totalPartialPayloads = this.getRowCount(this.TABLES.CMDB_IRE_PARTIAL_PAYLOADS, '', {
            active: true
        });
        this.populateBaseAggData(this.SUB_CATEGORY.TOTAL_PARTIAL_PAYLOADS, null, totalPartialPayloads, this.STATES.DRAFT, '', '');
        this.updateBaseAggDataState(this.STATES.READY, this.STATES.RETIRED, this.SUB_CATEGORY.TOTAL_PARTIAL_PAYLOADS);
        this.updateBaseAggDataState(this.STATES.DRAFT, this.STATES.READY, this.SUB_CATEGORY.TOTAL_PARTIAL_PAYLOADS);
    },

	_populatePartialPayloadMetrics: function() {
		this._populateTotalPartialPayload();
		this._populatePartialPayloadItemAggregates();
		
		this._deleteInactiveAndEmptyPartialPayloadItems();
		var jobCtx = this._getRuntimeAttributeJSONValue(this.SUB_CATEGORY.PARTIAL_PAYLOAD_ITEM);
		if (!global.JSUtil.nil(jobCtx) && jobCtx.allBatchCompleted) {
			this._deleteRuntimeAttribute(this.SUB_CATEGORY.PARTIAL_PAYLOAD_ITEM);
		}
	},

	_deleteAndInsertDeltaPartialPayloadItems: function(testMaxBatchExecutionTime, testDeleteJobCtx, testRuntimeThreshold) {
		var categoryDetail = this._getCategoryDetails(this.SUB_CATEGORY.PARTIAL_PAYLOAD_ITEM);
		if (!categoryDetail.active) { //only calculate the metric aggregate if it's active
			return;
		}

		var jobCtx = this._getRuntimeAttributeJSONValue(categoryDetail.sys_id);
		var jobTotalTimeSpent = '';
		if (!global.JSUtil.nil(jobCtx)) {
			if (jobCtx.allBatchCompleted) {
				return;
			}
			if (!global.JSUtil.nil(jobCtx.statsId)) {
				jobTotalTimeSpent = this._getJobTimeSpent(jobCtx.statsId);
				var runtimeCheckThreshold = testRuntimeThreshold ? testRuntimeThreshold : categoryDetail.runtime_threshold;
				if (jobTotalTimeSpent >= runtimeCheckThreshold) {
					this._updateExecutionStatsRuntimeAndStatus(jobCtx.statsId, jobTotalTimeSpent, categoryDetail.runtime_threshold);
					jobCtx.allBatchCompleted = true;
					this._saveRuntimeAttribute(categoryDetail.sys_id, JSON.stringify(jobCtx));
					return;
				}
			}
		} else {
			var canRun = this._canRunMetricAndDetermineActivation(categoryDetail.sys_id, categoryDetail.fail_count_threshold, categoryDetail.runtime_threshold);
			if (!canRun) {
				return;
			}
			jobCtx = this._initializeRunTimeAttribute();
			this._saveRuntimeAttribute(categoryDetail.sys_id, JSON.stringify(jobCtx));
		}

		var statsId = global.JSUtil.nil(jobCtx.statsId) ? this._initializeExecutionStatsWithMetric(categoryDetail.sys_id) : jobCtx.statsId;
		jobCtx.statsId = statsId;
		var tableNameToIdMap = jobCtx.tableNameToIdMap;
		
		var startTime = new GlideDateTime().getNumericValue();
		var allBatchCompleted = false;
		var batchSize = Number(gs.getProperty(this.SYS_PROPERTIES_NAME.PARTIAL_PAYLOAD_BATCH_SIZE, this.BATCH_DEFAULT_SIZE));
		var maxBatchExecutionTime = testMaxBatchExecutionTime ? testMaxBatchExecutionTime : this.MAX_BATCH_EXECUTION_TIME;
		try {
			do {
				var lastSysId = jobCtx.lastSysId;
				var payloadIds = {};
				var irePartialPayloadGr = new GlideRecord(this.TABLES.CMDB_IRE_PARTIAL_PAYLOADS);
				irePartialPayloadGr.addActiveQuery();
				if (global.JSUtil.notNil(lastSysId)) {
					irePartialPayloadGr.addQuery(this.COLS.SYS_ID, ">", lastSysId);
				}
				irePartialPayloadGr.setCategory(this.CMDB_WORKSPACE_DB_CATEGORY);
				irePartialPayloadGr.setLimit(batchSize);
				irePartialPayloadGr.orderBy(this.COLS.SYS_ID);
				irePartialPayloadGr.query();
				var rowCount = irePartialPayloadGr.getRowCount();
				allBatchCompleted = rowCount < batchSize ? true : false;
				while (irePartialPayloadGr.next()) {
					jobCtx.payloadCount++;
					var payloadId = irePartialPayloadGr.getUniqueValue();
					payloadIds[payloadId] = {};
				}
				if (rowCount > 0) {
					jobCtx.lastSysId = irePartialPayloadGr.getValue(this.COLS.SYS_ID);
				}
				this._processPartialPayloadItems(payloadIds, jobCtx, categoryDetail.aggregate_limit);

				gs.info('Finished workspace partial payload item 1 batch. Total payload processed: ' + jobCtx.payloadCount);

				if (!allBatchCompleted && this._getTimeSpent(startTime) >= maxBatchExecutionTime) {
					this._aggregateJobRuntime(startTime, jobCtx);
					gs.info('Workspace partial payload item max batch execution time exceeded. Current runtime in seconds: ' + jobCtx.runtime);
					this._saveRuntimeAttribute(categoryDetail.sys_id, JSON.stringify(jobCtx));
					return;
				}
			} while(!allBatchCompleted);
		} catch(e) {
			jobTotalTimeSpent = this._getJobTimeSpent(statsId);
			this._updateExecutionStatsRuntimeAndStatus(statsId, jobTotalTimeSpent, categoryDetail.runtime_threshold, this.EXECUTION_STATUS.ERROR);
			jobCtx.allBatchCompleted = true;
			this._saveRuntimeAttribute(categoryDetail.sys_id, JSON.stringify(jobCtx));
			throw e;
		}
		this._aggregateJobRuntime(startTime, jobCtx);
		jobTotalTimeSpent = this._getJobTimeSpent(statsId);
		this._updateExecutionStatsRuntimeAndStatus(statsId, jobTotalTimeSpent, categoryDetail.runtime_threshold);
		jobCtx.allBatchCompleted = true;
		this._saveRuntimeAttribute(categoryDetail.sys_id, JSON.stringify(jobCtx));
		if (testDeleteJobCtx) {
			this._deleteRuntimeAttribute(categoryDetail.sys_id);
		}
	},

	_getPartialPayloadItemHash: function() {
		var digest = new GlideDigest();
		var itemHash = {};
		var itemGr = new GlideRecord(this.TABLES.SN_CMDB_WS_PARTIAL_PAYLOAD_ITEM);
		itemGr.query();
		while (itemGr.next()) {
			var source = itemGr.getValue(this.COLS.DISCOVERY_SOURCE);
			var table = itemGr.getValue(this.COLS.CLASS_NAME);
			var error = itemGr.getValue(this.COLS.ERROR_TYPE);
			var toHash = source + '|' + table + '|' + error;
			var hash = digest.md5_digest(toHash);
			itemHash[hash] = true;
		}
		return itemHash;
	},

	_initializeRunTimeAttribute: function() {
		var jobCtx = {lastSysId: '', runtime: 0, sourceAggregate: {}, statsId: '', allBatchCompleted: false, tableNameToIdMap: {}, itemCount: {}, payloadCount: 0, itemHash: {}};
		var itemGa = new GlideAggregate(this.TABLES.SN_CMDB_WS_PARTIAL_PAYLOAD_ITEM);
		itemGa.addAggregate(this.COUNT_AGGREGATE);
		itemGa.groupBy(this.COLS.DISCOVERY_SOURCE);
		itemGa.query();
		while (itemGa.next()) {
			var count = itemGa.getAggregate(this.COUNT_AGGREGATE);
			var source = itemGa.getValue(this.COLS.DISCOVERY_SOURCE);
			jobCtx.itemCount[source] = count;
		}
		jobCtx.itemHash = this._getPartialPayloadItemHash();
		return jobCtx;
	},

    _deleteInactiveAndEmptyPartialPayloadItems: function() {
        var payloadItemGr = new GlideRecord(this.TABLES.SN_CMDB_WS_PARTIAL_PAYLOAD_ITEM);
        payloadItemGr.addEncodedQuery(this.COLS.PARTIAL_PAYLOAD + this.OPERATORS.ISEMPTY, false);
        payloadItemGr.query();
        payloadItemGr.deleteMultiple();
    },

    _processPartialPayloadItems: function(payloadIds, jobCtx, aggregateLimit) {
        var digest = new GlideDigest();
        var itemList = [];
        var tableNameToIdMap = jobCtx.tableNameToIdMap;
        var sourceAggregate = jobCtx.sourceAggregate;
        var itemCount = jobCtx.itemCount;
        var irePartialPayloadGr = new GlideRecord(this.TABLES.CMDB_IRE_PARTIAL_PAYLOADS);
		irePartialPayloadGr.setCategory(this.CMDB_WORKSPACE_DB_CATEGORY);
        irePartialPayloadGr.addQuery(this.COLS.SYS_ID, Object.keys(payloadIds));
        irePartialPayloadGr.query();
        while (irePartialPayloadGr.next()) {
            var payload = irePartialPayloadGr.getValue(this.COLS.PAYLOAD_ITEM);
            var payloadId = irePartialPayloadGr.getUniqueValue();
            if (global.JSUtil.nil(payload)) {
                continue;
            }
            var json = '';
            try {
                json = JSON.parse(payload);
            } catch (e) {
                continue;
            }
            if (global.JSUtil.nil(json)) {
                continue;
            }
            var items = json.items;
            if (global.JSUtil.nil(items)) {
                continue;
            }
            for (var i = 0; i < items.length; i++) {
                var item = items[i];
                if (global.JSUtil.nil(item) || global.JSUtil.nil(item.sys_object_source_info)) {
                    continue;
                }
                var sourceObject = item.sys_object_source_info;
                var source = sourceObject.source_name;
                if (global.JSUtil.nil(sourceAggregate[source])) {
                    sourceAggregate[source] = 0;
                }
                sourceAggregate[source]++;
                if (global.JSUtil.nil(itemCount[source])) {
                    itemCount[source] = 0;
                }
                if (itemCount[source] >= aggregateLimit) {
                    continue;
                }
                var tableId = '';
                if (global.JSUtil.notNil(tableNameToIdMap[item.className])) {
                    tableId = tableNameToIdMap[item.className];
                } else {
                    tableId = this.getTableSysId(item.className);
                    tableNameToIdMap[item.className] = tableId;
                }
                var error = '';
                if (global.JSUtil.notNil(item.reason)) {
                    error = this.transformUnderscoreStrToFirstLetterUpperCase(item.reason);
                }
                var toHash = source + '|' + tableId + '|' + error;
                var hash = digest.md5_digest(toHash);
                if (jobCtx.itemHash[hash]) {
                    continue;
                } else {
                    jobCtx.itemHash[hash] = true;
                }
                var itemObj = {
                    source: source,
                    tableId: tableId,
                    error: error,
                    payloadId: payloadId,
                };
                itemList.push(itemObj);
                if (itemList.length >= this.BATCH_DEFAULT_SIZE) {
                    this._insertPartialPayloadItems(itemList, itemCount);
                    itemList = [];
                }
            }
            this._insertPartialPayloadItems(itemList, itemCount);
            itemList = [];
        }
    },

    _insertPartialPayloadItems: function(itemList, itemCount) {
		var itemGr = new GlideRecord(this.TABLES.SN_CMDB_WS_PARTIAL_PAYLOAD_ITEM);
        for (var i = 0; i < itemList.length; i++) {
            var obj = itemList[i];
            itemGr.initialize();
            itemGr.setValue(this.COLS.DISCOVERY_SOURCE, obj.source);
            itemGr.setValue(this.COLS.PARTIAL_PAYLOAD, obj.payloadId);
            itemGr.setValue(this.COLS.ERROR_TYPE, obj.error);
            itemGr.setValue(this.COLS.CLASS_NAME, obj.tableId);
            var id = itemGr.insert();
            if (global.JSUtil.notNil(id)) {
                itemCount[obj.source]++;
            }
        }
    },

    _populateCMDBRelatedEntryAggregates: function() {
        //if there are any agg records in "draft" state, for this chart, mark them as "retired"
        this.updateBaseAggDataState(this.STATES.DRAFT, this.STATES.RETIRED, this.SUB_CATEGORY.RELATED_RECORDS);

        var resultObj = this._getCMDBRelatedEntryMissingRefCount();
        for (var tableSysId in resultObj) {
            this.populateBaseAggData(this.SUB_CATEGORY.RELATED_RECORDS, null, resultObj[tableSysId], this.STATES.DRAFT, tableSysId);
        }

        // Update the existing records in "Ready" state to "Retired"
        this.updateBaseAggDataState(this.STATES.READY, this.STATES.RETIRED, this.SUB_CATEGORY.RELATED_RECORDS);
        // Update the existing records in "Draft" state to "Ready"
        this.updateBaseAggDataState(this.STATES.DRAFT, this.STATES.READY, this.SUB_CATEGORY.RELATED_RECORDS);
    },

    _getCMDBRelatedEntryMissingRefCount: function() {
        var resultObj = {};

        var relEntryObj = this.getCMDBRelatedEntryRefFields();
        if (relEntryObj && Object.keys(relEntryObj).length > 0) {
            for (var tableName in relEntryObj) {
                var tableSysId = this.getTableSysId(tableName);
                var encodedQuery = this.buildCustomEncodedQuery(relEntryObj[tableName], this.OPERATORS.ISEMPTY, null, this.OPERATORS.OR);
                var rowCount = this.getRowCount(tableName, encodedQuery, null, this.BOOLEAN.FALSE);
                if (rowCount > 0) {
                    resultObj[tableSysId] = rowCount;
                }
            }
        }

        return resultObj;
    },

    _populateDuplicateAndStaleAggregates: function() {
        // Retire any agg records that may be in draft state
        this.updateBaseAggDataState(this.STATES.DRAFT, this.STATES.RETIRED, this.SUB_CATEGORY.STALE_RECORDS);
        this.updateBaseAggDataState(this.STATES.DRAFT, this.STATES.RETIRED, this.SUB_CATEGORY.DUPLICATE_RECORDS);

        var staleGroupCountGa = this.getRowCountByGroup(this.TABLES.CMDB_HEALTH_RESULT, this.STALENESS_METRIC_QUERY, '', this.COLS.CLASS_NAME, this.BOOLEAN.FALSE);
        this.populateAggregatesByTable(staleGroupCountGa, this.COLS.CLASS_NAME, this.SUB_CATEGORY.STALE_RECORDS);

        var duplicateGroupCountGa = this.getRowCountByGroup(this.TABLES.CMDB_DUPLICATE_AUDIT_RESULT, '', '', this.COLS.CI_SYS_CLASS_NAME, this.BOOLEAN.FALSE);
        this.populateAggregatesByTable(duplicateGroupCountGa, this.COLS.CI_SYS_CLASS_NAME, this.SUB_CATEGORY.DUPLICATE_RECORDS);
    },

    _populateRelationshipMissingParentOrChild: function() {
        this.updateBaseAggDataState(this.STATES.DRAFT, this.STATES.RETIRED, this.SUB_CATEGORY.RELATIONSHIP_MISSING_PARENT_OR_CHILD);
        var parentOrChildEmptyQuery = this.COLS.PARENT + this.OPERATORS.ISEMPTY + this.OPERATORS.OR + this.COLS.CHILD + this.OPERATORS.ISEMPTY;
        var relMissingParentOrChild = this.getRowCount(this.TABLES.CMDB_REL_CI, parentOrChildEmptyQuery, null, this.BOOLEAN.FALSE);
        this.populateBaseAggData(this.SUB_CATEGORY.RELATIONSHIP_MISSING_PARENT_OR_CHILD, null, relMissingParentOrChild, this.STATES.DRAFT, '', '');
        this.updateBaseAggDataState(this.STATES.READY, this.STATES.RETIRED, this.SUB_CATEGORY.RELATIONSHIP_MISSING_PARENT_OR_CHILD);
        this.updateBaseAggDataState(this.STATES.DRAFT, this.STATES.READY, this.SUB_CATEGORY.RELATIONSHIP_MISSING_PARENT_OR_CHILD);
    },

    _processIntegrationOutliers: function() {
        var applications = this._getIntegrationApplications(this.INTEGRATION_EXECUTION_TERMINAL_STATE_ENC_QUERY);
        var result = [];
        this._calculateAndInsertOutlierData(
            this.SUB_CATEGORY.INTEGRATION_PROCESSING_RATE_OUTLIER,
            this.PA_INDICATORS.INTEGRATION_PROCESSING_RATE.ID,
            this.PA_INDICATORS.INTEGRATION_PROCESSING_RATE.BREAKDOWN.CMDB_INST_APPLICATION.ID,
            applications
        );

        this._calculateAndInsertOutlierData(
            this.SUB_CATEGORY.INTEGRATION_ROWS_OUTLIER,
            this.PA_INDICATORS.INTEGRATION_ROWS.ID,
            this.PA_INDICATORS.INTEGRATION_ROWS.BREAKDOWN.CMDB_INST_APPLICATION.ID,
            applications
        );
    },

    _calculateAndInsertOutlierData: function(featureId, indicatorId, breakdownId, applications) {
        //if there are any agg records in "draft" state, for this chart, mark them as "retired"
        this.updateBaseAggDataState(this.STATES.DRAFT, this.STATES.RETIRED, featureId);

        for (var i = 0; i < applications.length; i++) {
            var outlierCount = this._getOutliersCount(indicatorId, breakdownId, applications[i]);
            this._populateIntegrationAggData(featureId, applications[i], outlierCount, this.STATES.DRAFT);
        }

        // Update the existing records in "Ready" state to "Retired"
        this.updateBaseAggDataState(this.STATES.READY, this.STATES.RETIRED, featureId);
        // Update the existing records in "Draft" state to "Ready"
        this.updateBaseAggDataState(this.STATES.DRAFT, this.STATES.READY, featureId);
    },

    _getIntegrationApplications: function(encodedQuery) {
        var applications = [];
        if (gs.tableExists(this.TABLES.SN_CMDB_INT_UTIL_CMDB_INTEGRATION_EXECUTION)) {
            var ga = new GlideAggregate(this.TABLES.SN_CMDB_INT_UTIL_CMDB_INTEGRATION_EXECUTION);
            ga.groupBy(this.COLS.APPLICATION);
            ga.addNotNullQuery(this.COLS.APPLICATION);
            if (!global.JSUtil.nil(encodedQuery)) {
                ga.addEncodedQuery(encodedQuery, this.BOOLEAN.TRUE);
            }
            ga.query();
            while (ga.next()) {
                applications.push(ga.getValue(this.COLS.APPLICATION));
            }

        }
        return applications;
    },

    _getOutliersCount: function(indicatorId, breakdownId, breakdownElementId) {
        var indicatorDetails = this.getIndicatorDetails(indicatorId, breakdownId, breakdownElementId, this.INTEGRATIONS_OUTLIER_LOOKBACK_DAYS, {
            includeBand: true
        });

        var count = 0;
        if (!global.JSUtil.nil(indicatorDetails) && !global.JSUtil.nil(indicatorDetails.dataObjArr)) {
            var data = indicatorDetails.dataObjArr;
            for (var i = 0; i < data.length; i++) {
                var currData = data[i];
                // a given data point is an outlier if it falls outside of prediction band range
                if (currData.value < currData.predictionBandRangeLower || currData.value > currData.predictionBandRangeUpper) {
                    count++;
                }
            }
        }
        return count;
    },

    _populateIntegrationAggData: function(chart, applicationId, count, state) {
        var gr = new GlideRecord(this.TABLES.SN_CMDB_WS_INTEGRATION_AGGREGATE_DATA);
        gr.initialize();
        gr.setValue(this.COLS.CHART, chart);
        gr.setValue(this.COLS.APPLICATION, applicationId);
        gr.setValue(this.COLS.COUNT, count);
        gr.setValue(this.COLS.STATE, state);
        gr.insert();
    },

    getIntegrationAggDataGr: function(encodedQuery, orderBy) {
        var gr = new GlideRecord(this.TABLES.SN_CMDB_WS_INTEGRATION_AGGREGATE_DATA);
        gr.addQuery(this.COLS.STATE, this.STATES.READY);
        gr.addQuery(this.COLS.CHART, [this.SUB_CATEGORY.INTEGRATION_PROCESSING_RATE_OUTLIER, this.SUB_CATEGORY.INTEGRATION_ROWS_OUTLIER]);
        if (global.JSUtil.notNil(encodedQuery)) {
            gr.addEncodedQuery(encodedQuery, this.BOOLEAN.TRUE);
        }
        if (global.JSUtil.notNil(orderBy)) {
            gr.orderBy(orderBy);
        }
        gr.query();
        return gr;
    },

	getIntegrationDataSourceSysIds: function() {
		var gr = new GlideRecordSecure(this.TABLES.CMDB_INST_APPLICATION_FEED);
		gr.addEncodedQuery(this.COLS.SYS_DATA_SOURCE + this.OPERATORS.ISNOTEMPTY + this.OPERATORS.AND + this.COLS.NAME + this.OPERATORS.NOTLIKE + this.IH_ETL_DEMODATA_PREFIX);
		gr.query();
		var sysIds = [];
		while(gr.next()) {
			sysIds.push(gr.getValue(this.COLS.SYS_DATA_SOURCE));
		}
		return sysIds;
	},

    type: 'CMDBWsPerfInsightsUtil'
});
