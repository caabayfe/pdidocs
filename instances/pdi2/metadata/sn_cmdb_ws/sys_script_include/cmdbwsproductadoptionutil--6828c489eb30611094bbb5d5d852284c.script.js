var CMDBWsProductAdoptionUtil = Class.create();
CMDBWsProductAdoptionUtil.prototype = Object.extendsObject(CMDBWorkspaceUtil, {
    initialize: function() {
        this.PRODUCT_ADOPTION_STATE = {
            IN_USE: {
                id: "in_use",
                label: gs.getMessage("In use"),
                color: "positive",
                variant: "primary",
                positive: true
            },
            NOT_IN_USE: {
                id: "not_in_use",
                label: gs.getMessage("Not in use"),
                color: "orange",
                variant: "primary",
                positive: false
            },
            INSTALLED: {
                id: "installed",
                label: gs.getMessage("Installed"),
                color: "positive",
                variant: "primary",
                positive: true
            },
            NOT_INSTALLED: {
                id: "not_installed",
                label: gs.getMessage("Not installed"),
                color: "orange",
                variant: "primary",
                positive: false
            },
            ENABLED: {
                id: "enabled",
                label: gs.getMessage("Enabled"),
                color: "positive",
                variant: "primary",
                positive: true
            },
            NOT_ENABLED: {
                id: "not_enabled",
                label: gs.getMessage("Not enabled"),
                color: "orange",
                variant: "primary",
                positive: false
            },
            NOT_LICENSED: {
                id: "not_licensed",
                label: gs.getMessage("Not licensed"),
                color: "orange",
                variant: "primary",
                positive: false
            },
            INFO_NOT_AVAILABLE: {
                id: "info_not_available",
                positive: false,
                hide: true
            }
        };

        this.PRODUCT_ADOPTION_RATING = {
            low: {
                id: "low",
                badge: {
                    "label": gs.getMessage("Low adoption"),
                    "color": "orange",
                    "variant": "primary"
                },
                dialColorConfig: {
                    "type": "singleColor",
                    "values": [{
                        "color": "f60b282d7709211078521605bc5a9974", //Color Grouped - Orange 2
                        "metric": "metric_0",
                        "rules": []
                    }]
                }
            },
            moderate: {
                id: "moderate",
                badge: {
                    "label": gs.getMessage("Moderate adoption"),
                    "color": "moderate",
                    "variant": "primary"
                },
                dialColorConfig: {
                    "type": "singleColor",
                    "values": [{
                        "color": "f88ae42d7709211078521605bc5a99e5", //alert moderate
                        "metric": "metric_0",
                        "rules": []
                    }]
                }

            },
            high: {
                id: "high",
                badge: {
                    "label": gs.getMessage("High adoption"),
                    "color": "positive",
                    "variant": "primary"
                },
                dialColorConfig: {
                    "type": "singleColor",
                    "values": [{
                        "color": "304a642d7709211078521605bc5a9993", //data vis color green 6
                        "metric": "metric_0",
                        "rules": []
                    }]
                }

            }

        };
        this.PRODUCT_ADOPTION_METADATA = {
            "dataSourceLabel": gs.getMessage("adoption"),
            "format": {
                "unitFormat": "{0}%"
            }
        };

        this.DATA_INGESTION = {
            IH_ETL: {
                DEMO_URL: 'https://www.youtube.com/watch?v=eIvfQcq5AgY',
                LEARN_MORE_URL: '/api/now/v1/context_doc_url/IntegrationHub_ETL_Landing',
                PRODUCT_URL: 'nav_to.do?uri=%2F$cmdb_integration_studio.do',
                STORE_URL: this.buildAppStoreUrl('/sn_appstore_store.do#!/store/application/d43fe173dba23300c121f3c61d961958')
            },
            CMDB_API: {
                LEARN_MORE_URL: '/api/now/v1/context_doc_url/CMDB_Cli_Commands_Landing',
                STORE_URL: this.buildAppStoreUrl('/sn_appstore_store.do#!/store/application/6541a411773220108043270bba1061c7')
            },
            SG_CONNECTORS: {
                DEMO_URL: 'https://www.youtube.com/watch?v=eIvfQcq5AgY',
                LEARN_MORE_URL: '/api/now/v1/context_doc_url/Service-Graph-Connectors_Landing',
                STORE_URL: this.buildAppStoreUrl('/sn_appstore_store.do#!/store/integrations?freeTrial=service_graph_certified')
            }
        };

        this.DATA_GOVERNANCE = {
            DATA_ATTESTATION: {
                LEARN_MORE_URL: '/api/now/v1/context_doc_url/CI_Attestation_Landing',
                PRODUCT_URL: 'my-work'
            },
            DATA_MANAGER: {
                LEARN_MORE_URL: '/api/now/v1/context_doc_url/Data_Manager_Entry',
                PRODUCT_URL: this.userHasRole('sn_cmdb_admin') ? 'data-manager' : 'my-work',
                STORE_URL: this.buildAppStoreUrl('/sn_appstore_store.do#!/store/application/6541a411773220108043270bba1061c7')
            },
            DATA_SYNC: {
                LEARN_MORE_URL: '/api/now/v1/context_doc_url/CSDM_Set_Group_Using_CI_Class_Mgr',
                PRODUCT_URL: 'nav_to.do?uri=$ciModel.do'
            },
            PRINCIPAL_CLASSES: {
                LEARN_MORE_URL: '/api/now/v1/context_doc_url/CMDB_Update_Classes_Principal_Class_Filter',
                PRODUCT_URL: 'nav_to.do?uri=$ciModel.do'
            }
        };

        this.SEARCH_AND_ANALYTICS = {
            CMDB_360: {
                DEMO_URL: 'https://www.youtube.com/watch?v=xpdXGsSoOwE',
                LEARN_MORE_URL: '/api/now/v1/context_doc_url/CMDB_Wrkspc_CMDB360_View',
                PRODUCT_URL: 'multisource-analytics'
            },
            DATA_FOUNDATION_DASHBOARD: {
                DEMO_URL: 'https://www.youtube.com/watch?v=aPHxWoVdD1c',
                LEARN_MORE_URL: '/api/now/v1/context_doc_url/CMDB_CSDM_Foundations_Dashboard_Landing',
                PRODUCT_URL: '/now/platform-analytics-workspace/dashboards/params/edit/false/sys-id/2e740da85b1372651129c580866219b2',
                STORE_URL: this.buildAppStoreUrl('/sn_appstore_store.do#!/store/application/5c0b68e35300101032b7ddeeff7b1231')
            },
            INTELLIGENT_SEARCH: {
                LEARN_MORE_URL: 'api/now/v1/context_doc_url/CMDB_Intelligent_Search',
                PRODUCT_URL: 'home',
            },
            QUERY_BUILDER: {
                DEMO_URL: 'https://www.youtube.com/watch?v=NArqszOamHc',
                LEARN_MORE_URL: '/api/now/v1/context_doc_url/CMDB_Query_Builder_Landing',
                PRODUCT_URL: '$queryBuilder.do',
            },
            HEALTH_DASHBOARD: {
                DEMO_URL: 'https://www.youtube.com/watch?v=aPHxWoVdD1c',
                LEARN_MORE_URL: '/api/now/v1/context_doc_url/CMDB_Health_Dashboard_Landing',
                PRODUCT_URL: 'health-dashboard',
            }
        };
    },

	getCIsProcessedViaIRERating: function() {
		var donutUsingIreCount = 0;
		var donutNotUsingIreCount = 0;

		var gr = new GlideRecord(this.TABLES.SN_CMDB_WS_BASE_AGGREGATE_DATA);
		gr.addQuery(this.COLS.CHART, this.SUB_CATEGORY.CIS_PROCESSED_VIA_IRE);
		gr.addQuery(this.COLS.STATE, this.STATES.READY);
		gr.query();
		while (gr.next()) {
			var groupBy = gr.getValue(this.COLS.GROUP_BY);
			var count = this.parseNumericString(gr.getValue(this.COLS.COUNT));
			if (groupBy == this.IF_USE_IRE_GROUPBY.USING_IRE_TYPE) {
				donutUsingIreCount = count;
			} else {
				donutNotUsingIreCount = count;
			}
		}
		if (donutUsingIreCount + donutNotUsingIreCount == 0) {
			return 0;
		}
		var rating = Math.round(donutUsingIreCount / (donutUsingIreCount + donutNotUsingIreCount) * 100);
		return rating > 100 ? 100 : rating;
	},

	getCIsProcessedViaIRE: function() {
		var donutUsingIreCount = 0;
		var donutNotUsingIreCount = 0;

		var cmdbCount = 0;
		var cmdbGa = new GlideAggregate(this.TABLES.CMDB_CI);
		cmdbGa.addAggregate(this.COUNT_AGGREGATE);
		cmdbGa.setCategory(this.CMDB_WORKSPACE_DB_CATEGORY);

		var sourceGa = new GlideAggregate(this.TABLES.SYS_OBJECT_SOURCE);
		sourceGa.addEncodedQuery(this.COLS.TARGET_TABLE + this.QUERY_INSTANCEOF + this.TABLES.CMDB_CI, false);
		sourceGa.addAggregate(this.COUNT_DISTINCT_AGGREGATE, this.COLS.TARGET_SYS_ID);
		sourceGa.setGroup(false);
		sourceGa.setCategory(this.CMDB_WORKSPACE_DB_CATEGORY);

		var queryAllData = false;
		var manualFullScan = false;
		var savedNotUsingIreCount = 0;
		var savedUsingIreCount = 0;
		var gr = new GlideRecord(this.TABLES.SN_CMDB_WS_FEATURE_CATEGORY_RUNTIME_ATTRIBUTE);
		gr.addQuery(this.COLS.FEATURE_CATEGORY, this.SUB_CATEGORY.CIS_PROCESSED_VIA_IRE);
		gr.query();
		if (gr.next()) {
			queryAllData = this.parseBooleanString(gr.getDisplayValue(this.COLS.QUERY_ALL_DATA));
			var lastRunTime = new GlideDateTime(gr.getValue(this.COLS.LAST_RUN_TIME));
			manualFullScan = this.parseBooleanString(gs.getProperty(this.SYS_PROPERTIES_NAME.CIS_PROCESSED_VIA_IRE_BY_SOURCE_FULL_SCAN, 'false'));
			if (queryAllData) {
				gr.setValue(this.COLS.QUERY_ALL_DATA, false);
			}
			gr.setValue(this.COLS.LAST_RUN_TIME, new GlideDateTime());
			gr.update();
			if (manualFullScan || queryAllData) {
				gs.debug('CMDB Workspace CIs processed Via IRE donut full scan triggered on ' + new GlideDateTime().getDisplayValue());
			} else {
				gs.debug('CMDB Workspace CIs processed Via IRE donut delta scan triggered on ' + new GlideDateTime().getDisplayValue());
				cmdbGa.addQuery(this.COLS.SYS_CREATED_ON, this.OPERATORS.GREATER, lastRunTime);
				sourceGa.addQuery(this.COLS.SYS_CREATED_ON, this.OPERATORS.GREATER, lastRunTime);
				var usingIREAgg = this.getAggregateData(this.SUB_CATEGORY.CIS_PROCESSED_VIA_IRE, this.IF_USE_IRE_GROUPBY.USING_IRE_TYPE, this.STATES.READY);
				if (!gs.nil(usingIREAgg) && usingIREAgg.length > 0) {
					savedUsingIreCount = usingIREAgg[0].count ? parseInt(usingIREAgg[0].count) : 0;
				}
				var notUsingIREAgg = this.getAggregateData(this.SUB_CATEGORY.CIS_PROCESSED_VIA_IRE, this.IF_USE_IRE_GROUPBY.NOT_USING_IRE_TYPE, this.STATES.READY);
				if (!gs.nil(notUsingIREAgg) && notUsingIREAgg.length > 0) {
					savedNotUsingIreCount = notUsingIREAgg[0].count ? parseInt(notUsingIREAgg[0].count) : 0;
				}
			}
		} else {
			gs.debug('CMDB Workspace CIs processed Via IRE donut full scan triggered on ' + new GlideDateTime().getDisplayValue());

			gr.initialize();
			gr.setValue(this.COLS.FEATURE_CATEGORY, this.SUB_CATEGORY.CIS_PROCESSED_VIA_IRE);
			gr.setValue(this.COLS.QUERY_ALL_DATA, false);
			gr.setValue(this.COLS.LAST_RUN_TIME, new GlideDateTime());
			gr.insert();
            queryAllData = true;
		}

		var savedCMDBCount = savedNotUsingIreCount + savedUsingIreCount;
		cmdbGa.query();
		if (cmdbGa.next()) {
			var currentCmdbCount = this.parseNumericString(cmdbGa.getAggregate(this.COUNT_AGGREGATE));
			if (!manualFullScan && !queryAllData) {
				gs.debug('CMDB Workspace CIs processed Via IRE donut delta scan - delta CMDB record count: ' + currentCmdbCount);
			}
			cmdbCount = savedCMDBCount + currentCmdbCount;
		}

		sourceGa.query();
		while (sourceGa.next()) {
			var currentUsingIreCount = this.parseNumericString(sourceGa.getAggregate(this.COUNT_DISTINCT_AGGREGATE, this.COLS.TARGET_SYS_ID));
			if (!manualFullScan && !queryAllData) {
				gs.debug('CMDB Workspace CIs processed Via IRE donut delta scan - delta sys_object_source record count: ' + currentUsingIreCount);
			}
			donutUsingIreCount = savedUsingIreCount + currentUsingIreCount;
		}

		donutNotUsingIreCount = cmdbCount - donutUsingIreCount > 0 ? cmdbCount - donutUsingIreCount : 0;

		this.createCisProcessedViaIreAggregate();
		this.updateBaseAggDataState(this.STATES.READY, this.STATES.RETIRED, this.SUB_CATEGORY.CIS_PROCESSED_VIA_IRE);
		this.updateDraftFeatureCategoryAggregate(this.SUB_CATEGORY.CIS_PROCESSED_VIA_IRE, this.STATES.READY, donutUsingIreCount, this.IF_USE_IRE_GROUPBY.USING_IRE_TYPE);
		this.updateDraftFeatureCategoryAggregate(this.SUB_CATEGORY.CIS_PROCESSED_VIA_IRE, this.STATES.READY, donutNotUsingIreCount, this.IF_USE_IRE_GROUPBY.NOT_USING_IRE_TYPE);
	},
	
	getCIsProcessedViaIREBySource: function() {
		var jobCtx = this._getRuntimeAttributeJSONValue(this.SUB_CATEGORY.CIS_PROCESSED_VIA_IRE_BY_SOURCE);
		if (!global.JSUtil.nil(jobCtx) && jobCtx.allBatchCompleted) {
			this._saveRuntimeAttribute(this.SUB_CATEGORY.CIS_PROCESSED_VIA_IRE_BY_SOURCE, '');
		}
	},

	_getInstAppSource: function() {
		var instAppSources = {};
		var gr = new GlideRecord(this.TABLES.CMDB_INST_APPLICATION);
		gr.query();
		while (gr.next()) {
			var name = gr.getValue(this.COLS.NAME);
			if (name.startsWith(this.IH_ETL_DEMODATA_PREFIX)) {
				continue;
			}
			var source = gr.getValue(this.COLS.DISCOVERY_SOURCE);
			instAppSources[source] = true;
		}
		return instAppSources;
	},

	_getSnDiscoverySources: function() {
		var snDiscoverySources = {};
		for (var snSourceName in this.SERVICENOW_DISCOVERY_SOURCE) {
			snDiscoverySources[this.SERVICENOW_DISCOVERY_SOURCE[snSourceName]] = true;
		}
		return snDiscoverySources;
	},

	_updateCIsProcessedViaIRERuntimeAttributes: function(categoryId, queryAllData, lastRunTime) {
		var gr = new GlideRecord(this.TABLES.SN_CMDB_WS_FEATURE_CATEGORY_RUNTIME_ATTRIBUTE);
		gr.addQuery(this.COLS.FEATURE_CATEGORY, categoryId);
		gr.query();
		if (gr.next()) {
			if (queryAllData != null) {
				gr.setValue(this.COLS.QUERY_ALL_DATA, queryAllData);
			}
			if (lastRunTime != null) {
				gr.setValue(this.COLS.LAST_RUN_TIME, lastRunTime);
			}
			gr.update();
		}
	},

	determineAndRunCIsProcessedViaIREBySourceMode: function(testBatchSize, testMaxBatchExecutionTime, testDeleteJobCtx, testRuntimeThreshold, testDeleteJobCtxJson) {
		var gr = new GlideRecord(this.TABLES.SN_CMDB_WS_FEATURE_CATEGORY_RUNTIME_ATTRIBUTE);
		gr.addQuery(this.COLS.FEATURE_CATEGORY, this.SUB_CATEGORY.CIS_PROCESSED_VIA_IRE_BY_SOURCE);
		gr.query();
		if (gr.next()) {
			var jobCtx = '';
			try {
				jobCtx = JSON.parse(gr.getValue(this.COLS.JSON));
			} catch(e) {
				jobCtx = '';
			}
			if (global.JSUtil.nil(jobCtx)) {
				var queryAllData = this.parseBooleanString(gr.getDisplayValue(this.COLS.QUERY_ALL_DATA));
				var manualFullScan = this.parseBooleanString(gs.getProperty(this.SYS_PROPERTIES_NAME.CIS_PROCESSED_VIA_IRE_BY_SOURCE_FULL_SCAN, 'false'));
				
				if (manualFullScan || queryAllData) {
					gs.debug('CMDB Workspace CIs processed Via IRE by source batch full scan triggered on ' + new GlideDateTime().getDisplayValue());
					gr.setValue(this.COLS.LAST_RUN_TIME, new GlideDateTime());
					gr.update();
					this.getCIsProcessedViaIREBySourceFull(testBatchSize, testMaxBatchExecutionTime, testDeleteJobCtx, testRuntimeThreshold, testDeleteJobCtxJson);
				} else {
					gs.debug('CMDB Workspace CIs processed Via IRE by source batch delta scan triggered on ' + new GlideDateTime().getDisplayValue());
					this.getCIsProcessedViaIREBySourceDelta(testBatchSize, testMaxBatchExecutionTime, testDeleteJobCtx, testRuntimeThreshold, testDeleteJobCtxJson);
				}
			} else {
				var runDelta = jobCtx.runDelta;
				if (runDelta) {
					gs.debug('CMDB Workspace CIs processed Via IRE by source batch delta scan triggered on ' + new GlideDateTime().getDisplayValue());
					this.getCIsProcessedViaIREBySourceDelta(testBatchSize, testMaxBatchExecutionTime, testDeleteJobCtx, testRuntimeThreshold, testDeleteJobCtxJson);
				} else {
					gs.debug('CMDB Workspace CIs processed Via IRE by source batch full scan triggered on ' + new GlideDateTime().getDisplayValue());
					this.getCIsProcessedViaIREBySourceFull(testBatchSize, testMaxBatchExecutionTime, testDeleteJobCtx, testRuntimeThreshold, testDeleteJobCtxJson);
				}
			}
		} else {
			gs.debug('CMDB Workspace CIs processed Via IRE by source full scan triggered on ' + new GlideDateTime().getDisplayValue());
			gr.initialize();
			gr.setValue(this.COLS.FEATURE_CATEGORY, this.SUB_CATEGORY.CIS_PROCESSED_VIA_IRE_BY_SOURCE);
			gr.setValue(this.COLS.QUERY_ALL_DATA, false);
			gr.setValue(this.COLS.LAST_RUN_TIME, new GlideDateTime());
			gr.insert();

			this.getCIsProcessedViaIREBySourceFull(testBatchSize, testMaxBatchExecutionTime, testDeleteJobCtx, testRuntimeThreshold, testDeleteJobCtxJson);
		}
	},

	_getDistinctDonutTargetCICount: function(targetSysIds, lastRunTime) {
		if (global.JSUtil.nil(targetSysIds) || targetSysIds.length <= 0) {
			return 0;
		}
		
		var existingCICount = 0;
		var sourceGa = new GlideAggregate(this.TABLES.SYS_OBJECT_SOURCE);
		sourceGa.addQuery(this.COLS.TARGET_SYS_ID, targetSysIds);
		sourceGa.addEncodedQuery(this.COLS.SYS_CREATED_ON + this.OPERATORS.LESSTHAN_OR_EQUAL + lastRunTime, false);
		sourceGa.addAggregate(this.COUNT_DISTINCT_AGGREGATE, this.COLS.TARGET_SYS_ID);
		sourceGa.setGroup(false);
		sourceGa.setCategory(this.CMDB_WORKSPACE_DB_CATEGORY);
		sourceGa.query();
		if (sourceGa.next()) {
			existingCICount = this.parseNumericString(sourceGa.getAggregate(this.COUNT_DISTINCT_AGGREGATE, this.COLS.TARGET_SYS_ID));
		}
		var newCiCount = targetSysIds.length - existingCICount;
		newCiCount = newCiCount >= 0 ? newCiCount : 0;
		return newCiCount;
	},

	_onBatchCIsProcessedViaIREBySourceDelta: function(batchGr, jobCtx, categoryDetail) {
		if (global.JSUtil.nil(jobCtx.instAppSources)) {
			jobCtx.instAppSources = this._getInstAppSource();
		}
		if (global.JSUtil.nil(jobCtx.snDiscoverySources)) {
			jobCtx.snDiscoverySources = this._getSnDiscoverySources();
		}
		var instAppSources = jobCtx.instAppSources;
		var snDiscoverySources = jobCtx.snDiscoverySources;
		var deltaCIIds = {};
		var objectSourceRecordCount = 0;
		var distinctTargetCICount = 0;
		var distinctDonutTargetCICount = 0;
		var lastRunTime = new GlideDateTime(jobCtx.lastRunTime);

		while (batchGr.next()) {
			objectSourceRecordCount++;
			var ciId = batchGr.getValue(this.COLS.TARGET_SYS_ID);
			if (jobCtx.previousTargetId != ciId) {
				jobCtx.previousTargetId = ciId;
				deltaCIIds[ciId] = true;
			}
		}
		var deltaCIIdList = Object.keys(deltaCIIds);
		distinctTargetCICount += deltaCIIdList.length;
		distinctDonutTargetCICount += this._getDistinctDonutTargetCICount(deltaCIIdList, lastRunTime);
		this.calculateDeltaCIsProcessedViaIREBySource(deltaCIIdList, instAppSources, snDiscoverySources, lastRunTime);
		jobCtx.donutUsingIreCount += distinctDonutTargetCICount;
		gs.info('CMDB Workspace CIs processed via IRE by source batch delta scan - processed delta sys_object_source record count: ' + objectSourceRecordCount);
		gs.info('CMDB Workspace CIs processed via IRE by source batch delta scan - distinct sys_object_source target CI count: ' + distinctTargetCICount);
	},

	_onAfterBatchCIsProcessedViaIREBySourceDelta: function(jobCtx, categoryDetail) {
		this._calculateAndCreateCIsProcessedViaIREDonutAggregate(jobCtx, true);
	},

	_initializeCIsProcessedViaIREBySourceDeltaJobCtxJson: function() {
		var lastRunTime = '';
		var gr = new GlideRecord(this.TABLES.SN_CMDB_WS_FEATURE_CATEGORY_RUNTIME_ATTRIBUTE);
		gr.addQuery(this.COLS.FEATURE_CATEGORY, this.SUB_CATEGORY.CIS_PROCESSED_VIA_IRE_BY_SOURCE);
		gr.query();
		if (gr.next()) {
			lastRunTime = gr.getValue(this.COLS.LAST_RUN_TIME);
			gr.setValue(this.COLS.LAST_RUN_TIME, new GlideDateTime());
			gr.update();
		}
		
		var jobCtx = {
			lastSysId: '', 
			runtime: 0, 
			statsId: '', 
			allBatchCompleted: false,
			identifier: 'CIsProcessedViaIREBySourceDelta',
			previousTargetId: '', 
			donutUsingIreCount: 0,
			lastRunTime: lastRunTime,
			runDelta: true,
			batchTable: this.TABLES.SYS_OBJECT_SOURCE,
			batchFixedQuery: this.COLS.TARGET_TABLE + this.QUERY_INSTANCEOF + this.TABLES.CMDB_CI + "^" + this.COLS.SYS_CREATED_ON + this.OPERATORS.GREATER + new GlideDateTime(lastRunTime),
			batchDynamicQuery: '',
			batchOrderByColumn: this.COLS.TARGET_SYS_ID,
			batchDbCategory: this.CMDB_WORKSPACE_DB_CATEGORY};
		return jobCtx;
	},
	
	getCIsProcessedViaIREBySourceDelta: function(testBatchSize, testMaxBatchExecutionTime, testDeleteJobCtx, testRuntimeThreshold, testDeleteJobCtxJson) {
		var categoryDetail = this._getCategoryDetails(this.SUB_CATEGORY.CIS_PROCESSED_VIA_IRE_BY_SOURCE);
		var getJobCtxJsonFn = this._initializeCIsProcessedViaIREBySourceDeltaJobCtxJson.bind(this);
		var getBatchGrFn = this._getDefaultBatchGr.bind(this);
		var onBatchFn = this._onBatchCIsProcessedViaIREBySourceDelta.bind(this);
		var onAfterBatchFn = this._onAfterBatchCIsProcessedViaIREBySourceDelta.bind(this);

		this._batchProcess(categoryDetail, getJobCtxJsonFn, null, getBatchGrFn, onBatchFn, onAfterBatchFn, testBatchSize, testMaxBatchExecutionTime, testDeleteJobCtx, testRuntimeThreshold, testDeleteJobCtxJson);
	},
	
	countDeltaDiscoveryType: function(oldState, newState, discoveryTypeToCount) {
		if (global.JSUtil.nil(newState)) {
			return;
		}
		if (global.JSUtil.nil(oldState)) {
			discoveryTypeToCount[newState] += 1;
			return;
		}
		if (oldState == newState) {
			return;
		} else {
			discoveryTypeToCount[newState] += 1;
			discoveryTypeToCount[oldState] -= 1;
		}
	},
	
	createDiscoveryTypeToCountObject: function() {
		var discoveryTypeToCount = {};
		discoveryTypeToCount[this.DISCOVERY_TYPE.SGC] = 0;
		discoveryTypeToCount[this.DISCOVERY_TYPE.SN] = 0;
		discoveryTypeToCount[this.DISCOVERY_TYPE.SGC_SN] = 0;
		discoveryTypeToCount[this.DISCOVERY_TYPE.OTHER] = 0;
		return discoveryTypeToCount;
	},
	
	calculateDeltaCIsProcessedViaIREBySource: function(deltaCIIdList, instAppSources, snDiscoverySources, lastRunTime) {
		var discoveryTypeToCount = this.createDiscoveryTypeToCountObject();
		var sgsnTypeState = '';
		var newTypeState = '';
		var previousTargetId = '';
		
		var gr = new GlideRecord(this.TABLES.SYS_OBJECT_SOURCE);
		gr.addQuery(this.COLS.TARGET_SYS_ID, deltaCIIdList);
		gr.orderBy(this.COLS.TARGET_SYS_ID);
		gr.setCategory(this.CMDB_WORKSPACE_DB_CATEGORY);
		gr.query();
		while (gr.next()) {
			var ciId = gr.getValue(this.COLS.TARGET_SYS_ID);
			var discoverySource = gr.getValue(this.COLS.NAME);
			var createdTime = new GlideDateTime(gr.getValue(this.COLS.SYS_CREATED_ON));

			if (ciId != previousTargetId) {
				previousTargetId = ciId;
				this.countDeltaDiscoveryType(sgsnTypeState, newTypeState, discoveryTypeToCount);
				sgsnTypeState = '';
				newTypeState = '';
			}

			newTypeState = this.calculateDiscoveryType(discoverySource, instAppSources, snDiscoverySources, newTypeState);
			if (createdTime <= lastRunTime) {
				sgsnTypeState = this.calculateDiscoveryType(discoverySource, instAppSources, snDiscoverySources, sgsnTypeState);
			}
		}
		this.countDeltaDiscoveryType(sgsnTypeState, newTypeState, discoveryTypeToCount);
		
		var stageDiscoveryTypeToCount = {};
		gr = new GlideRecord(this.TABLES.SN_CMDB_WS_BASE_AGGREGATE_DATA);
		gr.addQuery(this.COLS.CHART, this.SUB_CATEGORY.CIS_PROCESSED_VIA_IRE_BY_SOURCE);
        gr.addQuery(this.COLS.STATE, this.STATES.READY);
		gr.query();
		while (gr.next()) {
			var type = gr.getValue(this.COLS.GROUP_BY);
			var count = this.parseNumericString(gr.getValue(this.COLS.COUNT));
			var newCount = count + discoveryTypeToCount[type];
			stageDiscoveryTypeToCount[type] = newCount >= 0 ? newCount : 0;
		}
		this.createCisProcessedViaIreAggregate(true);
		this.updateBaseAggDataState(this.STATES.READY, this.STATES.RETIRED, this.SUB_CATEGORY.CIS_PROCESSED_VIA_IRE_BY_SOURCE);
		for (var source in this.DISCOVERY_TYPE) {
			this.updateDraftFeatureCategoryAggregate(this.SUB_CATEGORY.CIS_PROCESSED_VIA_IRE_BY_SOURCE, this.STATES.READY, stageDiscoveryTypeToCount[this.DISCOVERY_TYPE[source]], this.DISCOVERY_TYPE[source]);
		}
	},
	
	calculateDiscoveryType: function(discoverySource, instAppSources, snDiscoverySources, sgsnTypeState) {
		if (discoverySource.startsWith(this.QUALIFIER.SG) || discoverySource.startsWith(this.QUALIFIER.SGO) || instAppSources[discoverySource]) {
			if (sgsnTypeState == this.DISCOVERY_TYPE.OTHER || sgsnTypeState == this.DISCOVERY_TYPE.SGC_SN) {
				return sgsnTypeState;
			} else if (sgsnTypeState == this.DISCOVERY_TYPE.SN) { // Already SN
				return this.DISCOVERY_TYPE.SGC_SN; // Assign to both SG and SN
			} else {
				return this.DISCOVERY_TYPE.SGC; // Assign to SG
			}
		} else if (snDiscoverySources[discoverySource]) {
			if (sgsnTypeState == this.DISCOVERY_TYPE.OTHER || sgsnTypeState == this.DISCOVERY_TYPE.SGC_SN) {
				return sgsnTypeState;
			} else if (sgsnTypeState == this.DISCOVERY_TYPE.SGC) { // Already SG
				return this.DISCOVERY_TYPE.SGC_SN; // Assign to both SG and SN
			} else {
				return this.DISCOVERY_TYPE.SN; // Assign to SN
			}
		} else {
			return this.DISCOVERY_TYPE.OTHER; // Assign to other
		}
	},

	_calculateFullCIsProcessedViaIREBySource: function(targetSysId, discoveryTypeToCount, instAppSources, snDiscoverySources) {
		if (global.JSUtil.nil(targetSysId)) {
			return;
		}
		var sgsnTypeState = '';
		var gr = new GlideRecord(this.TABLES.SYS_OBJECT_SOURCE);
		gr.addQuery(this.COLS.TARGET_SYS_ID, targetSysId);
		gr.setCategory(this.CMDB_WORKSPACE_DB_CATEGORY);
		gr.query();
		while (gr.next()) {
			var discoverySource = gr.getValue(this.COLS.NAME);
			sgsnTypeState = this.calculateDiscoveryType(discoverySource, instAppSources, snDiscoverySources, sgsnTypeState);
		}
		this.countDiscoveryType(sgsnTypeState, discoveryTypeToCount);
	},

	_onAdvanceBatchCIsProcessedViaIREBySourceFull: function(jobCtx, categoryDetail) {
		if (global.JSUtil.nil(jobCtx.discoveryTypeToCount)) {
			jobCtx.discoveryTypeToCount = this.createDiscoveryTypeToCountObject();
		}
		if (global.JSUtil.nil(jobCtx.instAppSources)) {
			jobCtx.instAppSources = this._getInstAppSource();
		}
		if (global.JSUtil.nil(jobCtx.snDiscoverySources)) {
			jobCtx.snDiscoverySources = this._getSnDiscoverySources();
		}

		var discoveryTypeToCount = jobCtx.discoveryTypeToCount;
		var instAppSources = jobCtx.instAppSources;
		var snDiscoverySources = jobCtx.snDiscoverySources;
		var allBatchCompleted = false;
		var batchSize = jobCtx.batchSize;

		var batchGr = new GlideRecord(this.TABLES.SYS_OBJECT_SOURCE);
		batchGr.addEncodedQuery(this.COLS.TARGET_TABLE + this.QUERY_INSTANCEOF + this.TABLES.CMDB_CI, false);
		if (global.JSUtil.notNil(jobCtx.lastSysId)) {
			batchGr.addQuery(this.COLS.TARGET_SYS_ID, ">", jobCtx.lastSysId);
		}
		batchGr.setCategory(this.CMDB_WORKSPACE_DB_CATEGORY);
		batchGr.setLimit(batchSize);
		batchGr.orderBy(this.COLS.TARGET_SYS_ID);
		batchGr.query();
		var rowCount = batchGr.getRowCount();
		allBatchCompleted = rowCount < batchSize ? true : false;
		while (batchGr.next()) {
			var ciId = batchGr.getValue(this.COLS.TARGET_SYS_ID);

			if (jobCtx.previousTargetId != ciId) {
				jobCtx.donutUsingIreCount++;
				jobCtx.previousTargetId = ciId;
				this._calculateFullCIsProcessedViaIREBySource(ciId, discoveryTypeToCount, instAppSources, snDiscoverySources);
				if (this._getTimeSpent(jobCtx.startTime) >= jobCtx.maxBatchExecutionTime) {
					gs.info(jobCtx.identifier + ' inner batch max execution time exceeded.');
					jobCtx.lastSysId = batchGr.getValue(this.COLS.TARGET_SYS_ID);
					return false;
				}
			}
		}
		if (rowCount > 0) {
			jobCtx.lastSysId = batchGr.getValue(this.COLS.TARGET_SYS_ID);
		}
		gs.info('Finished workspace CIs processed via IRE by source Full 1 batch. Total record processed: ' + rowCount);
		return allBatchCompleted;
	},

	_onAfterBatchCIsProcessedViaIREBySourceFull: function(jobCtx, categoryDetail) {
		this.createCisProcessedViaIreAggregate(true);
		this.updateBaseAggDataState(this.STATES.READY, this.STATES.RETIRED, this.SUB_CATEGORY.CIS_PROCESSED_VIA_IRE_BY_SOURCE);
		for (var source in this.DISCOVERY_TYPE) {
			this.updateDraftFeatureCategoryAggregate(this.SUB_CATEGORY.CIS_PROCESSED_VIA_IRE_BY_SOURCE, this.STATES.READY, jobCtx.discoveryTypeToCount[this.DISCOVERY_TYPE[source]], this.DISCOVERY_TYPE[source]);
		}
		this._updateCIsProcessedViaIRERuntimeAttributes(this.SUB_CATEGORY.CIS_PROCESSED_VIA_IRE_BY_SOURCE, false, null);
		this._calculateAndCreateCIsProcessedViaIREDonutAggregate(jobCtx);
	},

	_calculateAndCreateCIsProcessedViaIREDonutAggregate: function(jobCtx, isDelta) {
		var donutUsingIreCount = jobCtx.donutUsingIreCount;
		var lastRunTime = new GlideDateTime(jobCtx.lastRunTime);
		var cmdbCount = 0;
		var cmdbGa = new GlideAggregate(this.TABLES.CMDB_CI);
		if (isDelta) {
			cmdbGa.addQuery(this.COLS.SYS_CREATED_ON, this.OPERATORS.GREATER, lastRunTime);
		}
		cmdbGa.addAggregate(this.COUNT_AGGREGATE);
		cmdbGa.setCategory(this.CMDB_WORKSPACE_DB_CATEGORY);
		cmdbGa.query();
		if (cmdbGa.next()) {
			cmdbCount = this.parseNumericString(cmdbGa.getAggregate(this.COUNT_AGGREGATE));
			if (isDelta) {
				var savedUsingIreCount = 0;
				var savedNotUsingIreCount = 0;
				var usingIREAgg = this.getAggregateData(this.SUB_CATEGORY.CIS_PROCESSED_VIA_IRE, this.IF_USE_IRE_GROUPBY.USING_IRE_TYPE, this.STATES.READY);
				if (!gs.nil(usingIREAgg) && usingIREAgg.length > 0) {
					savedUsingIreCount = usingIREAgg[0].count ? parseInt(usingIREAgg[0].count) : 0;
				}
				var notUsingIREAgg = this.getAggregateData(this.SUB_CATEGORY.CIS_PROCESSED_VIA_IRE, this.IF_USE_IRE_GROUPBY.NOT_USING_IRE_TYPE, this.STATES.READY);
				if (!gs.nil(notUsingIREAgg) && notUsingIREAgg.length > 0) {
					savedNotUsingIreCount = notUsingIREAgg[0].count ? parseInt(notUsingIREAgg[0].count) : 0;
				}
				var savedCMDBCount = savedNotUsingIreCount + savedUsingIreCount;
				cmdbCount = savedCMDBCount + cmdbCount;
				donutUsingIreCount = savedUsingIreCount + donutUsingIreCount;
			}
		}
		var donutNotUsingIreCount = cmdbCount - donutUsingIreCount > 0 ? cmdbCount - donutUsingIreCount : 0;

		this.createCisProcessedViaIreAggregate();
		this.updateBaseAggDataState(this.STATES.READY, this.STATES.RETIRED, this.SUB_CATEGORY.CIS_PROCESSED_VIA_IRE);
		this.updateDraftFeatureCategoryAggregate(this.SUB_CATEGORY.CIS_PROCESSED_VIA_IRE, this.STATES.READY, donutUsingIreCount, this.IF_USE_IRE_GROUPBY.USING_IRE_TYPE);
		this.updateDraftFeatureCategoryAggregate(this.SUB_CATEGORY.CIS_PROCESSED_VIA_IRE, this.STATES.READY, donutNotUsingIreCount, this.IF_USE_IRE_GROUPBY.NOT_USING_IRE_TYPE);
	},

	_initializeCIsProcessedViaIREBySourceFullJobCtxJson: function() {
		var jobCtx = {
			lastSysId: '', 
			runtime: 0, 
			statsId: '', 
			allBatchCompleted: false,
			identifier: 'CIsProcessedViaIREBySourceFull',
			previousTargetId: '', 
			discoveryTypeToCount: '',
			donutUsingIreCount: 0,
			runDelta: false,
		};
		return jobCtx;
	},

	getCIsProcessedViaIREBySourceFull: function(testBatchSize, testMaxBatchExecutionTime, testDeleteJobCtx, testRuntimeThreshold, testDeleteJobCtxJson) {
		var categoryDetail = this._getCategoryDetails(this.SUB_CATEGORY.CIS_PROCESSED_VIA_IRE_BY_SOURCE);
		var getJobCtxJsonFn = this._initializeCIsProcessedViaIREBySourceFullJobCtxJson.bind(this);
		var advanceBatchFn = this._onAdvanceBatchCIsProcessedViaIREBySourceFull.bind(this);
		var onAfterBatchFn = this._onAfterBatchCIsProcessedViaIREBySourceFull.bind(this);

		this._batchProcess(categoryDetail, getJobCtxJsonFn, advanceBatchFn, null, null, onAfterBatchFn, testBatchSize, testMaxBatchExecutionTime, testDeleteJobCtx, testRuntimeThreshold, testDeleteJobCtxJson);
	},

	countDiscoveryType: function(state, discoveryTypeToCount) {
		if (state == this.DISCOVERY_TYPE.SGC || state == this.DISCOVERY_TYPE.SN || state == this.DISCOVERY_TYPE.SGC_SN || state == this.DISCOVERY_TYPE.OTHER) {
			discoveryTypeToCount[state] += 1;
		}
	},

	createCisProcessedViaIreAggregate: function(isBySource) {
		if (isBySource) {
			this.deleteFeatureCategoryAggregate(this.SUB_CATEGORY.CIS_PROCESSED_VIA_IRE_BY_SOURCE, this.STATES.DRAFT);
			for (var source in this.DISCOVERY_TYPE) {
				this.populateBaseAggData(this.SUB_CATEGORY.CIS_PROCESSED_VIA_IRE_BY_SOURCE, this.DISCOVERY_TYPE[source], 0, this.STATES.DRAFT);
			}
		} else {
			this.deleteFeatureCategoryAggregate(this.SUB_CATEGORY.CIS_PROCESSED_VIA_IRE, this.STATES.DRAFT);
			for (var groupby in this.IF_USE_IRE_GROUPBY) {
				this.populateBaseAggData(this.SUB_CATEGORY.CIS_PROCESSED_VIA_IRE, this.IF_USE_IRE_GROUPBY[groupby], 0, this.STATES.DRAFT);
			}
		}
	},

    getProductAdoptionStates: function(category, excludeMarketingCopy) {
        var result = {};
        var ratings = {};

        var gr = new GlideRecord(this.TABLES.SN_CMDB_WS_FEATURE_CATEGORY);
        gr.addActiveQuery();
        gr.addQuery(this.COLS.FEATURE, this.CMDB_FEATURE_ADOPTION);
        gr.addNotNullQuery(this.COLS.SUBCATEGORY);
        if (category) {
            gr.addQuery(this.COLS.CATEGORY, category);
        }
        gr.query();

        // evaluate all the state and rating values for each record in the table
        while (gr.next()) {
            var currCategory = gr.getValue(this.COLS.CATEGORY);
            var currSubCategory = gr.getValue(this.COLS.SUB_CATEGORY);
            var currTitle = gr.getDisplayValue();
            var currStateScript = gr.getValue(this.COLS.STATE);
            var currRatingScript = gr.getValue(this.COLS.RATING);
            var currMarketingCopyScript = gr.getValue(this.COLS.MARKETING_COPY);

            if (!result[currCategory]) {
                result[currCategory] = {
                    features: {}
                };
                ratings[currCategory] = {};
            }

            var gse = new GlideScopedEvaluator();
            var state = null;
            if (currStateScript) {
                result[currCategory].features[currSubCategory] = {
                    title: currTitle
                };
                state = gse.evaluateScript(gr, this.COLS.STATE);
                result[currCategory].features[currSubCategory].state = state;
            }
            gse.putVariable("state", state);

            if (currRatingScript) {
                ratings[currCategory][currSubCategory] = gse.evaluateScript(gr, this.COLS.RATING);
            }

            if (currMarketingCopyScript && !excludeMarketingCopy) {
                result[currCategory].features[currSubCategory].marketingCopy = gse.evaluateScript(gr, this.COLS.MARKETING_COPY);
            }
        }

        // aggregate ratings for each category
        for (var _category in result) {
            var ratingSum = 0;
            var total = 0;

            for (var _subCategory in ratings[_category]) {
                ratingSum += ratings[_category][_subCategory];
                total += 100;
            }

            if (total > 0) {
                var categoryUsagePct = ratingSum / total * 100;
                result[_category].usage = this.makeUsageDataObj(categoryUsagePct);
                result[_category].usagePct = categoryUsagePct.toFixed(0);
                result[_category].rating = this.PRODUCT_ADOPTION_RATING[this.lookUpRating(this.INSIGHT_PRODUCT_CATEGORIES[_category.toUpperCase()], categoryUsagePct)];
                result[_category].highRating = this.getHighRating(this.INSIGHT_PRODUCT_CATEGORIES[_category.toUpperCase()]);
            }
        }

        result.lastUpdatedInfoText = gs.getMessage("Last updated: {0}", new GlideDateTime().getDisplayValue());
        return result;
    },

    makeUsageDataObj: function(usagePct) {
        //this is the format needed in the data visualization, single score
        var usage = [{
            "data": [{
                "value": usagePct
            }],
            "metadata": this.PRODUCT_ADOPTION_METADATA
        }];
        return usage;
    },

    lookUpRating: function(category, pct) {
        var rating;
        var gr = new GlideRecord(this.TABLES.SN_CMDB_WS_RATING_CONFIG);
        gr.addQuery(this.COLS.CATEGORY, category);
        gr.query();
        while (gr.next()) {
            if (pct >= gr.getValue(this.COLS.START) && pct <= gr.getValue(this.COLS.END)) {
                rating = gr.getValue(this.COLS.RATING);
                break;
            }
        }
        return rating;
    },
	
	getHighRating: function(category) {
		var rating;
		var gr = new GlideRecord(this.TABLES.SN_CMDB_WS_RATING_CONFIG);
		gr.addQuery(this.COLS.CATEGORY, category);
		gr.addQuery(this.COLS.RATING, this.PRODUCT_ADOPTION_RATING.high.id);
		gr.setLimit(1);
		gr.query();
		if (gr.next()) {
			rating = gr.getValue(this.COLS.START);
		}
		return rating;
	},

    isItomDiscoveryLicenseActive: function() {
        return this.hasActiveLicense(this.LICENSE.ITOM_DISCOVERY);
    },

    isItomDiscoveryLicensePluginActive: function() {
        return this.isPluginActive(this.PLUGINS.ITOM_DISCOVERY_LICENSE);
    },

    isItomLicensePluginActive: function() {
        return this.isPluginActive(this.PLUGINS.ITOM_LICENSE);
    },

    isIhEtlInstalled: function() {
        return this.isPluginActive(this.PLUGINS.INTEGRATION_HUB_ETL);
    },

    isCmdbApplicationForApiInstalled: function() {
        return this.isPluginActive(this.PLUGINS.CMDB_APPLICATION_FOR_API_AND_CLI);
    },

    isDataManagerUsed: function() {
        var policySysIds = [this.DATAMANAGER_POLICIES.RETIRE.SYS_ID, this.DATAMANAGER_POLICIES.ARCHIVE.SYS_ID, this.DATAMANAGER_POLICIES.DELETE.SYS_ID];
        var isDataManagerUsedActively = this.isDataManagerUsedForPolicies(policySysIds);
        if (isDataManagerUsedActively) {
            return true;
        }

        return this.verifyHistoricalUsage(this.PA_INDICATORS.DATA_MANAGER.ID);
    },

    isAttestationUsed: function() {
        var attestationPolicySysId = this.DATAMANAGER_POLICIES.ATTESTATION.SYS_ID;
        var isAttestationUsedActively = this.isDataManagerUsedForPolicies([attestationPolicySysId]);
        if (isAttestationUsedActively) {
            return true;
        }

        return this.verifyHistoricalUsage(this.PA_INDICATORS.DATA_ATTESTATION.ID);
    },

    isDataManagerUsedForPolicies: function(policySysIds) {
        var encodedQuery = "cdmp_cmdb_policy_typeIN" + policySysIds.join(",");
        var hasUserDefinedPolicies = this.hasRecord(this.TABLES.CMDB_DATA_MANAGER_POLICY_AND_ATTRIBUTES, encodedQuery, null, this.BOOLEAN.FALSE);
        var hasPolicyExecutionRecords = false;

        if (!hasUserDefinedPolicies) {
            encodedQuery = "cmdb_policy.cmdb_policy_typeIN" + policySysIds.join(",");
            hasPolicyExecutionRecords = this.hasRecord(this.TABLES.CMDB_DATA_MANAGEMENT_POLICY_EXECUTION, encodedQuery, null, this.BOOLEAN.FALSE);
        }
        return hasUserDefinedPolicies || hasPolicyExecutionRecords;
    },

    isQueryBuilderUsed: function() {
        var hasQbSavedQuery = this.hasRecord(this.TABLES.QB_SAVED_QUERY, null, {
            "source": this.QUERY_BUILDER_SOURCE
        }, this.BOOLEAN.FALSE);

        if (hasQbSavedQuery) {
            return true;
        }
        var indicatorId = this.PA_INDICATORS.QB_USAGE.ID;
        var breakdownId = this.PA_INDICATORS.QB_USAGE.BREAKDOWN.TOTAL_QUERY.ID;
        var breakdownElementId = this.getSysChoiceId("language=en^name=sn_cmdb_ws_base_aggregate_data^element=group_by^value=total_queries_executed^dependent_value=qb_queries", null, this.BOOLEAN.FALSE);

        return this.verifyHistoricalUsage(indicatorId, breakdownId, breakdownElementId);
    },

    isIntelligentSearchUsed: function() {
        var isIntelligentSearchActivelyUsed = this.hasRecord(this.TABLES.NLQ_QUERY_LOG, null, {
            source: this.INTELLIGENT_SEARCH_SOURCE
        }, this.BOOLEAN.FALSE);

        if (isIntelligentSearchActivelyUsed) {
            return true;
        }

        return this.verifyHistoricalUsage(this.PA_INDICATORS.INTELLIGENT_SEARCH.ID);
    },

    isCmdbHealthDashboardJobActive: function() {
        return this.hasRecord(this.TABLES.SYSAUTO, "nameLIKECMDB Health Dashboard", {
            active: true
        }, this.BOOLEAN.FALSE);
    },

    isDataFoundationDashboardInstalled: function() {
        return this.isPluginActive(this.PLUGINS.DATA_FOUNDATION_DASHBOARD);
    },

    isCmdb360Enabled: function() {
        var isDiscoveryInstalled = this.isItomDiscoveryLicensePluginActive();
        var isMultiSrcPropEnabled = this.getSystemProperty(this.SYS_PROPERTIES_NAME.MULTISRC_ENABLED, this.DATATYPE.BOOLEAN);
        return isDiscoveryInstalled && isMultiSrcPropEnabled;
    },

	populateAdoptionAggregates: function() {
		var disabledJobsStr = gs.getProperty(this.SYS_PROPERTIES_NAME.FEATURE_METRICS_CALCULATION_DISABLED, '');
		var disabledJobs = gs.nil(disabledJobsStr) ? [] : disabledJobsStr.split(',');
		this._populateDataManagerAggregates();
		this._populateDataAttestationAggregates();
		this._populateQBAggregates();
		this._populateIntelligentSearchAggregates();
	},

	populateAdoptionAggregatesMonthly: function() {
		var disabledJobsStr = gs.getProperty(this.SYS_PROPERTIES_NAME.FEATURE_METRICS_CALCULATION_DISABLED, '');
		var disabledJobs = gs.nil(disabledJobsStr) ? [] : disabledJobsStr.split(',');
		if (disabledJobs.indexOf(this.SUB_CATEGORY_NAME.CIS_PROCESSED_VIA_IRE_BY_SOURCE) < 0) {
			this.getCIsProcessedViaIREBySource();
		}
	},

    _populateDataManagerAggregates: function() {
        if (!this.isDataManagerUsed())
            return;

        var policies = [this.DATAMANAGER_POLICIES.RETIRE, this.DATAMANAGER_POLICIES.ARCHIVE, this.DATAMANAGER_POLICIES.DELETE,
            this.DATAMANAGER_POLICIES.DEPENDENT_CI_DELETION, this.DATAMANAGER_POLICIES.DEPENDENT_CI_RETIRE, this.DATAMANAGER_POLICIES.DEPENDENT_CI_ARCHIVE];

        //if there are any agg records in "draft" state, for this chart, mark them as "retired"
        this.updateBaseAggDataState(this.STATES.DRAFT, this.STATES.RETIRED, this.SUB_CATEGORY.DATA_MANAGER);

        for (var i = 0; i < policies.length; i++) {
            var ciCount = this._getCICountForPolicies(policies[i].SYS_ID);
            this.populateBaseAggData(this.SUB_CATEGORY.DATA_MANAGER, policies[i].GROUP_BY, ciCount, this.STATES.DRAFT);
        }

        // Update the existing records in "Ready" state to "Retired"
        this.updateBaseAggDataState(this.STATES.READY, this.STATES.RETIRED, this.SUB_CATEGORY.DATA_MANAGER);
        // Update the existing records in "Draft" state to "Ready"
        this.updateBaseAggDataState(this.STATES.DRAFT, this.STATES.READY, this.SUB_CATEGORY.DATA_MANAGER);
    },

    _populateDataAttestationAggregates: function() {
        if (!this.isAttestationUsed())
            return;

        //if there are any agg records in "draft" state, for this chart, mark them as "retired"
        this.updateBaseAggDataState(this.STATES.DRAFT, this.STATES.RETIRED, this.SUB_CATEGORY.DATA_ATTESTATION);

        var ciCount = this._getCICountForPolicies(this.DATAMANAGER_POLICIES.ATTESTATION.SYS_ID);
        this.populateBaseAggData(this.SUB_CATEGORY.DATA_ATTESTATION, this.DATAMANAGER_POLICIES.ATTESTATION.GROUP_BY, ciCount, this.STATES.DRAFT);

        // Update the existing records in "Ready" state to "Retired"
        this.updateBaseAggDataState(this.STATES.READY, this.STATES.RETIRED, this.SUB_CATEGORY.DATA_ATTESTATION);
        // Update the existing records in "Draft" state to "Ready"
        this.updateBaseAggDataState(this.STATES.DRAFT, this.STATES.READY, this.SUB_CATEGORY.DATA_ATTESTATION);
    },

    _getCICountForPolicies: function(policySysId) {
        var count = 0;
        var endTimeWithin24Hr = this.getRelative24hrEncodedQuery(this.COLS.END_TIME);
        var encodedQuery = "cmdb_policy.cmdb_policy_typeIN" + policySysId + "^execution_summaryISNOTEMPTY^" + endTimeWithin24Hr;
        var gr = new GlideRecord(this.TABLES.CMDB_DATA_MANAGEMENT_POLICY_EXECUTION);
        this.addQueryConditions(gr, encodedQuery, null, this.BOOLEAN.FALSE);
        gr.query();
        while (gr.next()) {
            var execSummary = gr.getValue(this.COLS.EXECUTION_SUMMARY);
            var execSummarySplit = execSummary.split(this.EXEC_SUMM_CI_COUNT_PREFIX);
            var ciCount = execSummarySplit.length > 1 ? parseInt(execSummarySplit[1].trim()) : 0;
            count += ciCount;
        }

        return count;
    },

    _populateQBAggregates: function() {
        //if there are any agg records in "draft" state, for this chart, mark them as "retired"
        this.updateBaseAggDataState(this.STATES.DRAFT, this.STATES.RETIRED, this.SUB_CATEGORY.QUERY_BUILDER);
        
        if(!this.isQueryBuilderUsed()) {
            this.populateBaseAggData(this.SUB_CATEGORY.QUERY_BUILDER, this.QB_REPORTS_GROUPBY.TOTAL_CI, this.getRowCount(this.TABLES.CMDB_CI), this.STATES.DRAFT);
            this.populateBaseAggData(this.SUB_CATEGORY.QUERY_BUILDER, this.QB_REPORTS_GROUPBY.TOTAL_CI_REL, this.getRowCount(this.TABLES.CMDB_REL_CI), this.STATES.DRAFT);
        } else {
            var resultObj = this._getQueriesExecutedCount();
            for (var groupby in resultObj) {
                this.populateBaseAggData(this.SUB_CATEGORY.QUERY_BUILDER, groupby, resultObj[groupby], this.STATES.DRAFT);
            }
        }
        
        // Update the existing records in "Ready" state to "Retired"
        this.updateBaseAggDataState(this.STATES.READY, this.STATES.RETIRED, this.SUB_CATEGORY.QUERY_BUILDER);
        // Update the existing records in "Draft" state to "Ready"
        this.updateBaseAggDataState(this.STATES.DRAFT, this.STATES.READY, this.SUB_CATEGORY.QUERY_BUILDER);
    },

    getCIandCIRelCount: function() {
        var ciCount = 0;
        var ciRelCount = 0;
        var gr = new GlideRecord(this.TABLES.SN_CMDB_WS_BASE_AGGREGATE_DATA);
        gr.addQuery(this.COLS.CHART, this.SUB_CATEGORY.QUERY_BUILDER);
        gr.addQuery(this.COLS.STATE, this.STATES.READY);
        gr.query();

        while (gr.next()) {
            var groupBy = gr.getValue(this.COLS.GROUP_BY);
            var count = gr.getValue(this.COLS.COUNT);
            if (groupBy === this.QB_REPORTS_GROUPBY.TOTAL_CI) {
                ciCount = count;
            } else if (groupBy === this.QB_REPORTS_GROUPBY.TOTAL_CI_REL) {
                ciRelCount = count;
            }
        }

        return {
            ciCount: this.abbreviateNumber(ciCount),
            ciRelCount: this.abbreviateNumber(ciRelCount)
        };
    },

    _getQueriesExecutedCount: function() {
        var result = {};
        var queriesCount = 0;
        var queriesWithReportsCount = 0;
        var createdWithin24Hr = this.getRelative24hrEncodedQuery(this.COLS.SYS_CREATED_ON);

        // No of queries executed with source as QB
        var gr = new GlideRecord(this.TABLES.QB_QUERY_STATUS);
        gr.addEncodedQuery(createdWithin24Hr, false);
        gr.query();
        while (gr.next()) {
            var sq = new GlideRecord(this.TABLES.QB_SAVED_QUERY);
            sq.addQuery(this.COLS.RESULT_TABLE, gr.getValue(this.COLS.TABLE_NAME));
            sq.addQuery(this.COLS.SOURCE, this.QUERY_BUILDER_SOURCE);
            sq.query();

            if (sq.next()) {
                queriesCount++;

                if (sq.getValue(this.COLS.REPORT_SOURCE) != null) {
                    queriesWithReportsCount++;
                }
            }
        }

        // Also consider record that exists in query_status table but not in saved_query table
        gr = new GlideRecord(this.TABLES.QB_QUERY_STATUS);
        gr.addEncodedQuery(createdWithin24Hr, false);
        gr.query();
        while (gr.next()) {
            sq = new GlideRecord(this.TABLES.QB_SAVED_QUERY);
            sq.addQuery(this.COLS.RESULT_TABLE, gr.getValue(this.COLS.TABLE_NAME));
            sq.query();

            if (!sq.next()) {
                var query = gr.getValue(this.COLS.QUERY);
                // Exclude NLQ queries
                if (query && this.isJson(query) && JSON.parse(query) && JSON.parse(query)[this.SOURCE_TYPE] != this.CMDB_QB) {
                    queriesCount++;
                }
            }
        }

        result[this.QB_REPORTS_GROUPBY.TOTAL_QUERIES_EXECUTED] = queriesCount;
        result[this.QB_REPORTS_GROUPBY.TOTAL_QUERIES_EXECUTED_REPORTS] = queriesWithReportsCount;

        return result;
    },

    /**
     * Returns the total and installed count of Service Graph Connectors
     * @return {object} count of total and installed SGC
     */
    getSGCCount: function() {
        var totalAgg = this.getAggregateData(this.SUB_CATEGORY.SERVICE_GRAPH_CONNECTOR, this.SGC_GROUP_BY_VALUE.SGC_TOTAL, this.STATES.READY);

        // if we don't have any data or if the data is older than 24 hrs refetch the data
        var shouldRefetch = gs.nil(totalAgg) || totalAgg.length === 0 || new GlideDateTime(totalAgg[0].updatedDt).before(new GlideDateTime(gs.hoursAgo(24)));
        var sgcData = this.getAllSGCs(shouldRefetch);

        var totalCount = sgcData.length;
        var installedCount = this.countInstalledSGC(sgcData);

        return {
            total: totalCount,
            installed: installedCount
        };
    },

    /**
     * Returns a list of Service Graph Connectors.
     *  - If refetch is true, calls the API to get the SGC data
     *  - If refetch is false, returns the SGC data currently stored
     *
     * @param {boolean} refetch - whether or not to call the API again to refetch the data
     * @return {array} list of SGC
     */
    getAllSGCs: function(refetch) {
        var savedSgcData = [];
        var gr = new GlideRecord(this.TABLES.SN_CMDB_WS_SERVICE_GRAPH_CONNECTOR);
        gr.query();
        while (gr.next()) {
            savedSgcData.push({
                scope: gr.getValue(this.COLS.SCOPE),
                company: gr.getValue(this.COLS.COMPANY),
                appId: gr.getValue(this.COLS.APPLICATION_ID),
                updatedDt: gr.getValue(this.COLS.SYS_UPDATED_DATE)
            });
        }

        var sgcData = savedSgcData;

        if (refetch) {
            var sgcApiResults = this.fetchSGCDataFromAppStore();
            // if Store API returned data, merge with the existing data and update the aggregates
            if (!gs.nil(sgcApiResults) && sgcApiResults.length > 0) {
                this.mergeSGCDataWithApiResults(savedSgcData, sgcApiResults);
                sgcData = sgcApiResults;
            }
            this.updateSGCAggData(sgcApiResults);
        }
        return sgcData;
    },

    /**
     * Updates the aggregate data for SGC
     */
    updateSGCAggData: function(sgcData) {
        var totalCount = sgcData.length;
        var installedCount = this.countInstalledSGC(sgcData);

        this.populateBaseAggData(this.SUB_CATEGORY.SERVICE_GRAPH_CONNECTOR, this.SGC_GROUP_BY_VALUE.SGC_TOTAL, totalCount, this.STATES.DRAFT);
        this.populateBaseAggData(this.SUB_CATEGORY.SERVICE_GRAPH_CONNECTOR, this.SGC_GROUP_BY_VALUE.SGC_INSTALLED, installedCount, this.STATES.DRAFT);

        // Update the existing records in "Ready" state to "Retired"
        this.updateBaseAggDataState(this.STATES.READY, this.STATES.RETIRED, this.SUB_CATEGORY.SERVICE_GRAPH_CONNECTOR);
        // Update the existing records in "Draft" state to "Ready"
        this.updateBaseAggDataState(this.STATES.DRAFT, this.STATES.READY, this.SUB_CATEGORY.SERVICE_GRAPH_CONNECTOR);
    },

    /**
     * Given the list of SGC data, counts how many of them are installed
     */
    countInstalledSGC: function(sgcList) {
        var installedCount = 0;
        for (var idx in sgcList) {
            var isInstalled = this.isPluginActive(sgcList[idx].scope);
            if (isInstalled) {
                installedCount++;
            }
        }
        return installedCount;
    },

    /**
     * Makes API call to fetch SGC data
     */
    fetchSGCDataFromAppStore: function() {
        var sgcEndpointUrl = this.buildAppStoreUrl("api/sn_appstore/v1/store_applications/service_graph");
        var response = this.httpGet(sgcEndpointUrl);
        if (response.status === 200) {
            return response.body.result;
        } else {
            gs.error("Unable to fetch Service Graph Connector data from AppStore. " + JSON.stringify(response));
            return [];
        }
    },

    /**
     * Merges SGC data stored in the table with the SGC data returned by the API
     *
     * @param {array} sgcStoredData - SGC data stored in the table
     * @param {array} sgcApiResults - SGC data returned by the API
     */
    mergeSGCDataWithApiResults: function(sgcStoredData, sgcApiResults) {
        var sgcStoredDataMap = {};
        var sgcApiResultsMap = {};

        var removedData = {};
        var addedData = {};

        for (var i in sgcStoredData) {
            var oElm = sgcStoredData[i];
            sgcStoredDataMap[oElm.scope] = oElm;
        }

        for (var j in sgcApiResults) {
            var nElm = sgcApiResults[j];
            sgcApiResultsMap[nElm.scope] = nElm;
        }

        // if a scope from sgcApiResultsMap doesn't exist on sgcStoredDataMap, it was added
        for (var _nKey in sgcApiResultsMap) {
            if (!sgcStoredDataMap[_nKey]) {
                addedData[_nKey] = sgcApiResultsMap[_nKey];
            }
        }

        // if a key from sgcStoredDataMap doesn't exist on sgcApiResultsMap, it was removed
        for (var _oKey in sgcStoredDataMap) {
            if (!sgcApiResultsMap[_oKey]) {
                removedData[_oKey] = sgcStoredDataMap[_oKey];
            }
        }
        // delete scope that was not part of the API response
        var deletedScopes = Object.keys(removedData);
        var gr = new GlideRecord(this.TABLES.SN_CMDB_WS_SERVICE_GRAPH_CONNECTOR);
        gr.addQuery(this.COLS.SCOPE, this.COLS.IN, deletedScopes.join());
        gr.query();
        gr.deleteMultiple();

        // add new scope from the API response
        for (var _newScope in addedData) {
            var sgc = addedData[_newScope];
            var gr = new GlideRecord(this.TABLES.SN_CMDB_WS_SERVICE_GRAPH_CONNECTOR);
            gr.initialize();
            gr.setValue(this.COLS.SCOPE, sgc.scope);
            gr.setValue(this.COLS.COMPANY, sgc.company);
            gr.setValue(this.COLS.APPLICATION_ID, sgc.appId);
            gr.insert();
        }
    },

    _populateIntelligentSearchAggregates: function() {
        //if there are any agg records in "draft" state, for this chart, mark them as "retired"
        this.updateBaseAggDataState(this.STATES.DRAFT, this.STATES.RETIRED, this.SUB_CATEGORY.INTELLIGENT_SEARCH);

        var createdTimeWithin24Hr = this.getRelative24hrEncodedQuery(this.COLS.SYS_CREATED_ON);
        this.populateBaseAggData(this.SUB_CATEGORY.INTELLIGENT_SEARCH, this.NLQ_GROUP_BY_VALUE.NLQ_NO_OF_QUERIES, this.getRowCount(this.TABLES.NLQ_QUERY_LOG, createdTimeWithin24Hr, null, this.BOOLEAN.FALSE), this.STATES.DRAFT);

        // Update the existing records in "Ready" state to "Retired"
        this.updateBaseAggDataState(this.STATES.READY, this.STATES.RETIRED, this.SUB_CATEGORY.INTELLIGENT_SEARCH);
        // Update the existing records in "Draft" state to "Ready"
        this.updateBaseAggDataState(this.STATES.DRAFT, this.STATES.READY, this.SUB_CATEGORY.INTELLIGENT_SEARCH);
    },

    verifyHistoricalUsage: function(indicatorId, breakdownId, breakdownElementId) {
        var indicatorDetails = this.getIndicatorDetails(indicatorId, breakdownId, breakdownElementId, this.PA_SCORES_LOOKBACK_LIMIT);
        if (indicatorDetails) {
            return this.atLeastOneScoreGreaterThan(indicatorDetails.dataObjArr, 0);
        }
        return false;
    },
	
	isDataSyncUsed: function() {
		var encodedQuery = "managed_by_group!=NULL";
		return this.hasRecord(this.TABLES.CMDB_CLASS_INFO, encodedQuery, null, this.BOOLEAN.FALSE);
	},
	
	isPrincipalClassesUsed: function() {
		var encodedQuery = "principal_class=true";
		return this.hasRecord(this.TABLES.CMDB_CLASS_INFO, encodedQuery, null, this.BOOLEAN.FALSE);
	},

    type: 'CMDBWsProductAdoptionUtil'
});
