var CMDBWsInsightUtil = Class.create();
CMDBWsInsightUtil.prototype = Object.extendsObject(CMDBWorkspaceUtil, {
    initialize: function() {
        this.DC_PROVIDER_MAPPING = {};
        this.CLASS_QB_RESULT_TABLE_MAP = {};

        this.APP_SVC_TYPE_LABEL = {
            'cloud': gs.getMessage('Cloud based services'),
            'non_cloud': gs.getMessage('Non-cloud services'),
            'hybrid': gs.getMessage('Hybrid services'),
            'unknown': gs.getMessage('Unknown services')
        };

        this.CLOUD_PARENT_CACHE = {};
    },

    QB_STATUS: {
        COMPLETE: 'COMPLETE',
        MAX_LIMIT: 'MAX_LIMIT',
        TIME_OUT: 'TIME_OUT',
        DISABLED: 'DISABLED'
    },

    DATACENTER_TYPE: {
        CLOUD: 'cloud',
        NONCLOUD: 'non_cloud'
    },

    APP_SVC_TYPES: {
        CLOUD: 'cloud',
        NONCLOUD: 'non_cloud',
        HYBRID: 'hybrid',
        UNKNOWN: 'unknown'
    },

    NONCLOUD_AS_PROVIDER: "Non-cloud",
    DC_CLASS_FIELD: "u_logical_datacenter_1.sys_class_name",
    CLOUD_SERVICE_ACC_DC_TYPE_FIELD: "u_cloud_service_account_1.datacenter_type",
    CLOUD_SERVICE_ACC_CATEGORY: "439485f577b3111078521605bc5a99ae",
    COUNT: "COUNT",
    CLOUD_CLASSES: {
        cmdb_ci_appl: 'cloud',
        cmdb_ci_db_instance: 'cloud',
        cmdb_ci_server: 'cloud',
        cmdb_ci_vm_instance: 'cloud',
        cmdb_ci_kubernetes_cluster: 'cloud',
        cmdb_ci_storage_volume: 'cloud',
        cmdb_ci_cloud_object_storage: 'cloud',
        cmdb_ci_cloud_service_account: 'cloud'
    },

    /**
     * Returns a string of comma separated cloud datacenters
     * @param {Boolean} checkAcl    whether or not not check the caller's ACL
     * @return {String}
     */
    getCloudFilters: function(checkAcl) {
        return this.getDataCentersOfType(this.DATACENTER_TYPE.CLOUD, checkAcl).join(",");
    },

    /**
     * Returns a string of comma separated non-cloud datacenters
     * @param {Boolean} checkAcl    whether or not not check the caller's ACL
     * @return {String}
     */
    getNonCloudFilters: function(checkAcl) {
        return this.getDataCentersOfType(this.DATACENTER_TYPE.NONCLOUD, checkAcl).join(",");
    },

    /**
     * Returns an array of datacenters configured for given type
     * @param {String} type         type of datacenter
     * @param {Boolean} checkAcl    whether or not not check the caller's ACL
     * @return {array}
     */
    getDataCentersOfType: function(type, checkAcl) {
        var gr;
        if (checkAcl) {
            gr = new GlideRecordSecure(this.TABLES.SN_CMDB_WS_DATACENTER_TYPE);
        } else {
            gr = new GlideRecord(this.TABLES.SN_CMDB_WS_DATACENTER_TYPE);
        }
        gr.addQuery(this.COLS.TYPE, type);
        gr.query();
        var datacenters = [];
        while (gr.next()) {
            datacenters.push(gr.getValue(this.COLS.DATACENTER_CLASS));
        }
        return datacenters;
    },

    hasCloudDataCenterData: function() {
        if (gs.tableExists(this.TABLES.CLOUD_SERVICE_ACCOUNT)) {
            var gr = new GlideRecord(this.TABLES.CMDB_CI_LOGICAL_DATACENTER);
            gr.addQuery(this.COLS.SYS_CLASS_NAME, this.COLS.IN, this.getCloudFilters(false));
            gr.setLimit(1);
            gr.query();

            return gr.hasNext();
        } else
            return false;
    },

    /**
     * Helper function to check if Cloud vs Noncloud asset tab should be included on landing page
     * @return {Boolean}
     */
    showCloudVsNonCloudAsset: function() {
        var hasCloudData = this.hasCloudDataCenterData();

        return hasCloudData;
    },

    /**
     * Helper function to check if Cloud vs Noncloud status container should be shown
     * @return {Boolean}
     */
    showCloudVsNonCloudStatusContainer: function() {
        var count = -1;
        var gr = new GlideAggregate(this.TABLES.SN_CMDB_WS_PRODUCT_INSIGHT_DATA);
        gr.addAggregate(this.COLS.COUNT);
        gr.query();

        if (gr.next()) {
            count = gr.getAggregate(this.COLS.COUNT);
        }

        return count > 0 ? true : false;
    },

    getQueryLatestExecutionData: function(savedQueryId) {
        //Originally this function was supposed to be a replica of the same function in QueryBuilderReport (because QBR was not open to all scopes), however
        //we need more data than just latest executionId, we also need, last updated on, status and result table name

        var status = [this.QB_STATUS.COMPLETE, this.QB_STATUS.MAX_LIMIT, this.QB_STATUS.TIME_OUT];
        var result = {
            executionId: null,
            status: null,
            updated: null,
            result_table: null
        };

        var glideSavedQuery = new GlideRecord(this.TABLES.QB_SAVED_QUERY);

        if (glideSavedQuery.get(savedQueryId) && glideSavedQuery.canRead()) {
            result.result_table = glideSavedQuery.getValue(this.COLS.RESULT_TABLE);
        }

        var glideQbStatus = new GlideRecord(this.TABLES.QB_QUERY_STATUS);
        glideQbStatus.addQuery(this.COLS.TABLE_NAME, result.result_table);
        glideQbStatus.addQuery(this.COLS.STATUS, 'IN', status);
        glideQbStatus.orderByDesc(this.COLS.UPDATED);
        glideQbStatus.setLimit(1);
        glideQbStatus.query();

        if (glideQbStatus.next() && glideQbStatus.canRead()) {
            result.executionId = glideQbStatus.getUniqueValue();
            result.status = glideQbStatus.getValue(this.COLS.STATUS);
            result.updated = glideQbStatus.getValue(this.COLS.UPDATED);
        }

        return result;
    },

    calculateAggregates: function() {
        //before doing any agregates, check for cloud data existence, and only proceed if cloud data exists on the instance
        if (this.hasCloudDataCenterData()) {
            var gr = new GlideRecord(this.TABLES.SN_CMDB_WS_QUERY_CATEGORY);
            gr.addQuery(this.COLS.ACTIVE, true);
            gr.query();
            while (gr.next()) { //for each of the type and ci class combo, i.e, "Cloud Application", "non-cloud server"
                var ciClass = gr.getValue(this.COLS.CI_CLASS);
                var type = gr.getValue(this.COLS.TYPE);
                var qbSavedQuery = gr.getValue(this.COLS.QUERY);
                var lastRefreshed = gr.getValue(this.COLS.LAST_REFRESHED);
                var ciCategorySysId = gr.getUniqueValue();

                gs.debug("processing " + type + " " + ciClass + " query, last refreshed " + lastRefreshed);

                var lastExecution = this.getQueryLatestExecutionData(qbSavedQuery);
                if (gs.nil(lastRefreshed) || new GlideDateTime(lastExecution.updated).after(new GlideDateTime(lastRefreshed))) {
                    //make sure results table exists first - no point in aggregating if result table does not exist
                    if (gs.tableExists(lastExecution.result_table)) {
                        //get new aggregate for this ciClass and type combo - only if last execution status is "COMPLETE"
                        if (lastExecution.status == this.QB_STATUS.COMPLETE) {
                            if (type == this.DATACENTER_TYPE.CLOUD) {
                                this.calculateCloudAggregate(ciCategorySysId, lastExecution.executionId, lastExecution.result_table);
                            } else {
                                this.calculateNonCloudAggregate(ciCategorySysId, lastExecution.executionId, lastExecution.result_table);
                            }
                            // reset the failure count
                            gr.setValue(this.COLS.FAILURE_COUNT, 0);
                        } else {
                            //mark agg data for this ci class & type as "retired"
                            gs.debug("The last execution of " + type + " " + ciClass + " did not complete. It was " + lastExecution.status);
                            this._updateState(this.STATES.READY, this.STATES.RETIRED, ciCategorySysId);
                            // +1 the current failure count
                            gr.setValue(this.COLS.FAILURE_COUNT, parseInt(gr.getValue(this.COLS.FAILURE_COUNT)) + 1);
                        }

                        //update the status and lastRefresh date on the query_category table
                        gr.setValue(this.COLS.LAST_REFRESHED, lastExecution.updated);
                        gr.setValue(this.COLS.STATUS, lastExecution.status);
                        gr.update();
                    } else {
                        gs.debug("result table for " + type + " " + ciClass + " does not exist yet");
                    }
                } else {
                    gs.debug("last execution query's updated time for " + type + " " + ciClass + " has not changed. No new data");
                    // if the underlying job has been disabled, mark the category as disabled and retire the aggregate data
                    var sysAutoGr = new GlideRecord(this.TABLES.SYSAUTO_QUERY_BUILDER);
                    sysAutoGr.addQuery(this.COLS.QUERY, qbSavedQuery);
                    sysAutoGr.query();
                    if (sysAutoGr.next()) {
                        var isJobActive = sysAutoGr.getDisplayValue(this.COLS.ACTIVE) === 'true' ? true : false;
                        if (!isJobActive) {
                            this._updateState(this.STATES.READY, this.STATES.RETIRED, ciCategorySysId);
                            gr.setValue(this.COLS.STATUS, this.QB_STATUS.DISABLED);
                            gr.update();
                        }
                    }
                }
            }
        }
    },

    updateQBJobActive: function(queryId, active) {
        var sysAutoGr = new GlideRecord(this.TABLES.SYSAUTO_QUERY_BUILDER);
        sysAutoGr.addQuery(this.COLS.QUERY, queryId);
        sysAutoGr.query();
        if (sysAutoGr.next()) {
            sysAutoGr.setValue(this.COLS.ACTIVE, active);
            sysAutoGr.update();
        }
    },

    getProvider: function(dcClass) {
        var providerName = null;
        if (this.DC_PROVIDER_MAPPING[dcClass]) {
            gs.debug("dc provider mapping exists for " + dcClass + ". It is " + this.DC_PROVIDER_MAPPING[dcClass]);
            return this.DC_PROVIDER_MAPPING[dcClass];
        } else {
            gs.debug("dc provider mapping does not exist for " + dcClass + ". Looking up");
            //given a logical datacenter class, return the shortened provider name
            var gr = new GlideRecord(this.TABLES.SN_CMDB_WS_DATACENTER_TYPE);
            gr.addQuery(this.COLS.DATACENTER_CLASS, dcClass);
            gr.query();
            if (gr.next()) {
                providerName = gr.getValue(this.COLS.CLOUD_PROVIDER);
                //add to dc provider mapping
                this.DC_PROVIDER_MAPPING[dcClass] = providerName;
            }
        }

        return providerName;
    },

    calculateCloudAggregate: function(ciCategory, executionId, resultTable) {
        this._updateState(this.STATES.DRAFT, this.STATES.RETIRED, ciCategory);
        //needs a different group by for cloud service account, since it needs to be grouped by datacenter_type field
        var groupByField = ciCategory === this.CLOUD_SERVICE_ACC_CATEGORY ? this.CLOUD_SERVICE_ACC_DC_TYPE_FIELD : this.DC_CLASS_FIELD;

        var agg = new GlideAggregate(resultTable);
        agg.addQuery(this.COLS.QUERY, executionId);
        agg.addAggregate(this.COUNT);
        agg.groupBy(groupByField);
        agg.query();

        while (agg.next()) {
            var dcClass = agg.getValue(groupByField);
            var count = agg.getAggregate(this.COUNT);
            var provider = this.getProvider(dcClass); //convert the dcClass into a provider

            //insert into the agg table if count is a positive number
            if (count > 0) {
                gs.debug("Inserting record into agg table for cloud " + ciCategory + " provider " + provider + " count " + count);
                this._populateCloudInsightAggData(this.CATEGORY.CLOUD_AND_NONCLOUD_CIS, ciCategory, provider, count, this.STATES.DRAFT);
            }

        }

        // Update the existing records in "Ready" state to "Retired"
        this._updateState(this.STATES.READY, this.STATES.RETIRED, ciCategory);

        // Update the existing records in "Draft" state to "Ready"
        this._updateState(this.STATES.DRAFT, this.STATES.READY, ciCategory);
    },

    calculateNonCloudAggregate: function(ciCategory, executionId, resultTable) {
        var aggCount = -1;
        //if there are any agg records in "draft" state, for this ciCategory, mark them as "retired"
        this._updateState(this.STATES.DRAFT, this.STATES.RETIRED, ciCategory);

        var agg = new GlideAggregate(resultTable);
        agg.addQuery(this.COLS.QUERY, executionId); //query=4228348f41e31110f8774131f61c4c85
        agg.addAggregate(this.COUNT);
        agg.query();
        if (agg.next()) {
            aggCount = agg.getAggregate(this.COUNT);
        }

        if (aggCount > 0) { //only insert when agg count is a positive number
            gs.debug("Inserting record into agg table for non-cloud " + ciCategory + " count " + aggCount);
            this._populateCloudInsightAggData(this.CATEGORY.CLOUD_AND_NONCLOUD_CIS, ciCategory, this.NONCLOUD_AS_PROVIDER, aggCount, this.STATES.DRAFT);
        }

        // Update the existing records in "Ready" state to "Retired"
        this._updateState(this.STATES.READY, this.STATES.RETIRED, ciCategory);

        // Update the existing records in "Draft" state to "Ready"
        this._updateState(this.STATES.DRAFT, this.STATES.READY, ciCategory);
    },

    _updateState: function(sourceState, targetState, ciCategory) {
        var gr = new GlideRecord(this.TABLES.SN_CMDB_WS_PRODUCT_INSIGHT_DATA);
        if (ciCategory)
            gr.addQuery(this.COLS.CI_CATEGORY, ciCategory);

        gr.addQuery(this.COLS.STATE, sourceState);
        gr.setValue(this.COLS.STATE, targetState);
        gr.updateMultiple();
    },

    _populateCloudInsightAggData: function(chart, ciCategory, cloudProvider, count, state) {
        var gr = new GlideRecord(this.TABLES.SN_CMDB_WS_PRODUCT_INSIGHT_DATA);
        gr.initialize();
        gr.setValue(this.COLS.CHART, chart);
        gr.setValue(this.COLS.CI_CATEGORY, ciCategory);
        gr.setValue(this.COLS.CLOUD_PROVIDER, cloudProvider);
        gr.setValue(this.COLS.COUNT, count);
        gr.setValue(this.COLS.STATE, state);

        gr.insert();

    },

    getCIClasses: function() {
        var ciClassesArr = [];
        var ga = new GlideAggregate(this.TABLES.SN_CMDB_WS_PRODUCT_INSIGHT_DATA);
        ga.addQuery(this.COLS.STATE, this.STATES.READY);
        ga.groupBy(this.COLS.CI_CATEGORY + this.COLS.DOT + this.COLS.CI_CLASS);
        ga.orderBy(this.COLS.CI_CATEGORY + this.COLS.DOT + this.COLS.CI_CLASS);
        ga.query();
        while (ga.next()) {
            ciClassesArr.push(ga.getValue(this.COLS.CI_CATEGORY + this.COLS.DOT + this.COLS.CI_CLASS));
        }
        return ciClassesArr;
    },

    /**
     * Returns a json arry in that format - for the data broker to be used in application services drill down page. Sample output
	 [
           {
        	  "id":"tab1",
        	  "label":"Tab 1",
        	  "count":7
           },
           {
        	  "id":"tab2",
        	  "label":"Tab 2",
        	  "count":3
           }
        ]
     * @return {Object}
     */
    getAppSvcTabs: function() {
        var result = {};
        var categoriesResults = [];
        var gr = new GlideAggregate(this.TABLES.SN_CMDB_WS_APP_SVC_INSIGHT_DATA);
        gr.addQuery(this.COLS.STATE, this.STATES.READY);
        gr.groupBy(this.COLS.GROUP_BY);
        gr.addAggregate(this.COUNT);
        gr.query();
        while (gr.next()) {
            var currGroup = gr.getValue(this.COLS.GROUP_BY);
            var categoryLabel = gr.getDisplayValue(this.COLS.GROUP_BY);
            var count = parseInt(gr.getAggregate(this.COUNT));
            if (count > 0) {
                categoriesResults.push({
                    'id': currGroup,
                    'categoryLabel': categoryLabel,
                    'label': this.APP_SVC_TYPE_LABEL[currGroup],
                    'count': count
                });
            }
        }
        result.categoryResults = categoriesResults;

        var updatedGr = new GlideRecord(this.TABLES.SN_CMDB_WS_APP_SVC_INSIGHT_DATA);
        updatedGr.orderByDesc(this.COLS.UPDATED);
        updatedGr.setLimit(1);
        updatedGr.query();

        if (updatedGr.next()) {
            var updatedOn = updatedGr.getValue(this.COLS.UPDATED);
            var gdt = new GlideDateTime(updatedOn);
            result.lastUpdatedOn = gs.getMessage("Last updated: {0}", gdt.getDisplayValue());
        }

        return result;
    },

    _insertAppSvcInsightData: function(serviceId, count, type, state) {
        var gr = new GlideRecord(this.TABLES.SN_CMDB_WS_APP_SVC_INSIGHT_DATA);
        gr.initialize();
        gr.setValue(this.COLS.CHART, this.SUB_CATEGORY.CLOUD_AND_NONCLOUD_APP_SVC);
        gr.setValue(this.COLS.SERVICE, serviceId);
        gr.setValue(this.COLS.COUNT, count);
        gr.setValue(this.COLS.GROUP_BY, type);
        gr.setValue(this.COLS.STATE, state);
        gr.insert();
    },

    _updateAppSvcInsightState: function(sourceState, targetState, serviceIds) {
        var gr = new GlideRecord(this.TABLES.SN_CMDB_WS_APP_SVC_INSIGHT_DATA);
        gr.addQuery(this.COLS.CHART, this.SUB_CATEGORY.CLOUD_AND_NONCLOUD_APP_SVC);
        if (serviceIds) {
            gr.addQuery(this.COLS.SERVICE, "IN", serviceIds);
        }
        gr.addQuery(this.COLS.STATE, sourceState);
        gr.setValue(this.COLS.STATE, targetState);
        gr.updateMultiple();

    },

    getExcludedTables: function(baseTables) {
        var excludedTables = [];
        for (var i = 0; i < baseTables.length; i++) {
            var allExtensions = new GlideTableHierarchy(baseTables[i]).getAllExtensions();
            if (allExtensions) {
                excludedTables = excludedTables.concat(allExtensions);
            }
        }
        return excludedTables;
    },

    _initializeServiceMetadata: function() {
        return {
            ciCountByType: {
                cloud: 0,
                non_cloud: 0,
                unknown: 0
            },
            totalCiCount: 0,
            svcType: this.APP_SVC_TYPES.UNKNOWN,
            isCurrSvcHybrid: false
        };
    },

    _initializeRunTimeAttribute: function() {
        var jobCtx = {
            lastServiceId: '',
            lastSvcCiAssocSysId: '',
            svcMetadata: this._initializeServiceMetadata(),
            identifier: 'CloudvsNonCloudAppServices',
            runtime: 0,
            statsId: '',
            allBatchCompleted: false
        };
        return jobCtx;
    },

    resetAppServiceClassificationJob: function() {
        var jobCtx = this._getRuntimeAttributeJSONValue(this.SUB_CATEGORY.CLOUD_AND_NONCLOUD_APP_SVC);
        if (!global.JSUtil.nil(jobCtx) && jobCtx.allBatchCompleted) {
            this._deleteRuntimeAttribute(this.SUB_CATEGORY.CLOUD_AND_NONCLOUD_APP_SVC);
        }
    },

    processApplicationServices: function(testBatchSize, testMaxBatchExecutionTime, testDeleteJobCtx, testRuntimeThreshold, testDeleteJobCtxJson) {
        this._updateAppSvcInsightState(this.STATES.DRAFT, this.STATES.RETIRED);
        if (!this.hasCloudDataCenterData()) {
            this._updateAppSvcInsightState(this.STATES.READY, this.STATES.RETIRED);
            return;
        }

        this.CLASS_QB_RESULT_TABLE_MAP = this.buildClassResultTableMap();

        var categoryDetail = this._getCategoryDetails(this.SUB_CATEGORY.CLOUD_AND_NONCLOUD_APP_SVC);

        var _batchFn = function(jobCtx, categoryDetail) {
            var batchSize = jobCtx.batchSize;
            var maxBatchExecutionTime = jobCtx.maxBatchExecutionTime;
            var startTime = jobCtx.startTime;
            var svcMetadata = jobCtx.svcMetadata;
            var lastServiceId = jobCtx.lastServiceId;
            var lastSvcCiAssocSysId = jobCtx.lastSvcCiAssocSysId;

            var cmdbCiServiceGr = new GlideRecord(this.TABLES.CMDB_CI_SERVICE);
            if (global.JSUtil.notNil(lastServiceId)) {
                var operator = global.JSUtil.notNil(lastSvcCiAssocSysId) ? this.OPERATORS.GREATER_OR_EQUAL : this.OPERATORS.GREATER;
                cmdbCiServiceGr.addQuery(this.COLS.SYS_ID, operator, lastServiceId);
            }
            cmdbCiServiceGr.orderBy(this.COLS.SYS_ID);
            cmdbCiServiceGr.setCategory(this.CMDB_WORKSPACE_DB_CATEGORY);
            cmdbCiServiceGr.setLimit(batchSize);

            cmdbCiServiceGr.query();
            var serviceCount = cmdbCiServiceGr.getRowCount();
            var allServiceFetched = serviceCount < batchSize;
            var isAllCisForCurrServiceProcessed = false;

            while (cmdbCiServiceGr.next()) {
                var lastSvcCiAssocSysId = jobCtx.lastSvcCiAssocSysId;
                var serviceId = cmdbCiServiceGr.getValue(this.COLS.SYS_ID);
                jobCtx.lastServiceId = serviceId;

                var exitCurrentBatch = false;

                do {
                    var svcCiAssocGr = new GlideRecord(this.TABLES.SVC_CI_ASSOC);
                    svcCiAssocGr.addQuery(this.COLS.SERVICE_ID, this.OPERATORS.EQUAL, serviceId);
                    if (global.JSUtil.notNil(lastSvcCiAssocSysId)) {
                        svcCiAssocGr.addQuery(this.COLS.SYS_ID, this.OPERATORS.GREATER, lastSvcCiAssocSysId);
                    }
                    svcCiAssocGr.orderBy(this.COLS.SYS_ID);
                    svcCiAssocGr.setLimit(batchSize);
                    svcCiAssocGr.setCategory(this.CMDB_WORKSPACE_DB_CATEGORY);
                    svcCiAssocGr.query();
                    var rowCount = svcCiAssocGr.getRowCount();
                    isAllCisForCurrServiceProcessed = rowCount < batchSize;

                    var ciSysIds = [];
                    lastSvcCiAssocSysId = '';

                    while (svcCiAssocGr.next()) {
                        var ciSysId = svcCiAssocGr.getValue(this.COLS.CI_ID);
                        ciSysIds.push(ciSysId);
                        lastSvcCiAssocSysId = svcCiAssocGr.getUniqueValue();
                    }

                    if (ciSysIds.length > 0) {
                        svcMetadata = this._processCis(svcMetadata, ciSysIds);
                    }

                    if (isAllCisForCurrServiceProcessed && svcMetadata.totalCiCount > 0) {
                        svcMetadata.svcType = svcMetadata.isCurrSvcHybrid ? this.APP_SVC_TYPES.HYBRID : this.determineAppSvcType(svcMetadata.ciCountByType);

                        //save svc type and ciCount to table as DRAFT
                        this._insertAppSvcInsightData(serviceId, svcMetadata.totalCiCount, svcMetadata.svcType, this.STATES.DRAFT);

                        // Update the existing records in "Ready" state to "Retired"
                        this._updateAppSvcInsightState(this.STATES.READY, this.STATES.RETIRED, serviceId);

                        // Update the Draft record to "Ready"
                        this._updateAppSvcInsightState(this.STATES.DRAFT, this.STATES.READY, serviceId);

                        svcMetadata = this._initializeServiceMetadata();
                    }

                    if (isAllCisForCurrServiceProcessed) {
                        lastSvcCiAssocSysId = '';
                    }

                    jobCtx.lastSvcCiAssocSysId = lastSvcCiAssocSysId;
                    jobCtx.svcMetadata = svcMetadata;

                    exitCurrentBatch = isAllCisForCurrServiceProcessed || (this._getTimeSpent(startTime) >= maxBatchExecutionTime);
                } while (!exitCurrentBatch);

                jobCtx.allBatchCompleted = allServiceFetched && !cmdbCiServiceGr.hasNext() && isAllCisForCurrServiceProcessed;

                if (!jobCtx.allBatchCompleted && this._getTimeSpent(startTime) >= maxBatchExecutionTime) {
                    return false;
                }
            }

            return jobCtx.allBatchCompleted;
        };

        var getJobCtxJsonFn = this._initializeRunTimeAttribute.bind(this);
        var advanceBatchFn = _batchFn.bind(this);

        this._batchProcess(categoryDetail, getJobCtxJsonFn, advanceBatchFn, null, null, null, testBatchSize, testMaxBatchExecutionTime, testDeleteJobCtx, testRuntimeThreshold, testDeleteJobCtxJson);
    },

    _processCis: function(svcMetadata, ciSysIds) {
        if (svcMetadata.isCurrSvcHybrid) {
            return svcMetadata;
        }
        var excludedTables = this.getExcludedTables([this.TABLES.CMDB_CI_ENDPOINT, this.TABLES.CMDB_CI_SERVICE]);
        var ciIdToClassMap = {};
        var classToCiMap = {};

        var ciGr = new GlideRecord(this.TABLES.CMDB);
        ciGr.addQuery(this.COLS.SYS_ID, this.OPERATORS.IN, ciSysIds);
        ciGr.addEncodedQuery(this.COLS.SYS_CLASS_NAME + this.OPERATORS.NOTIN + excludedTables, false);
        ciGr.setCategory(this.CMDB_WORKSPACE_DB_CATEGORY);
        ciGr.query();
        svcMetadata.totalCiCount += ciGr.getRowCount();

        while (ciGr.next()) {
            var ciSysId = ciGr.getValue(this.COLS.SYS_ID);
            var ciClass = ciGr.getValue(this.COLS.SYS_CLASS_NAME);
            var cloudParent = this.lookUpCloudParent(ciClass);
            ciIdToClassMap[ciSysId] = cloudParent;
            if (!classToCiMap[cloudParent]) {
                classToCiMap[cloudParent] = [];
            }
            classToCiMap[cloudParent].push(ciSysId);
        }

        for (var classKey in classToCiMap) {
            if (svcMetadata.isCurrSvcHybrid) {
                return svcMetadata;
            }
            var _ciSysIds = classToCiMap[classKey];
            var _ciClassfication = this.lookUpCisInQbResultTable(classKey, _ciSysIds);
            for (var i = 0; i < _ciSysIds.length; i++) {
                var _ciSysId = _ciSysIds[i];
                var type = _ciClassfication[_ciSysId];
                svcMetadata.ciCountByType[type]++;

                if (svcMetadata.ciCountByType[this.APP_SVC_TYPES.CLOUD] > 0 && svcMetadata.ciCountByType[this.APP_SVC_TYPES.NONCLOUD] > 0) {
                    svcMetadata.isCurrSvcHybrid = true;
                }
            }
        }

        return svcMetadata;
    },

    determineAppSvcType: function(typeObj) {
        if (typeObj[this.APP_SVC_TYPES.CLOUD] > 0 && typeObj[this.APP_SVC_TYPES.NONCLOUD] > 0)
            return this.APP_SVC_TYPES.HYBRID;
        if (typeObj[this.APP_SVC_TYPES.UNKNOWN] > 0) {
            return this.APP_SVC_TYPES.UNKNOWN;
        } else {
            if (typeObj[this.APP_SVC_TYPES.CLOUD] > 0)
                return this.APP_SVC_TYPES.CLOUD;
            if (typeObj[this.APP_SVC_TYPES.NONCLOUD] > 0)
                return this.APP_SVC_TYPES.NONCLOUD;
        }
    },

    /**
     * Builds object of ci_class_name to latestExecutionData 
     * @return {Object} - sample object
	 * { "cmdb_ci_server" : {
			 cloud : {
				 latestExecutionData : {
					 result_table : "u_qb_base",
					 status : "COMPLETE",
					 executionId : ""
				 },
				 lookupCol : "u_server_1"
			 },
			 non_cloud : {
				 latestExecutionData : {
					 result_table : "u_qb_base",
					 status : "COMPLETE"
				 },
				 lookupCol : "u_server_1"
			 }
		 }
	 }
     */
    buildClassResultTableMap: function() {
        var resultObj = {};
        var gr = new GlideRecord(this.TABLES.SN_CMDB_WS_QUERY_CATEGORY);
        gr.orderBy(this.COLS.CI_CLASS_NAME);
        gr.query();
        while (gr.next()) {
            var ciClassName = gr.getValue(this.COLS.CI_CLASS_NAME);
            var savedQueryId = gr.getValue(this.COLS.QUERY);
            var type = gr.getValue(this.COLS.TYPE);
            var typeObj = {
                lookupCol: gr.getValue(this.COLS.CI_LOOKUP_COL),
                lastExecution: this.getQueryLatestExecutionData(savedQueryId)
            };
            if (resultObj[ciClassName]) {
                resultObj[ciClassName][type] = typeObj;
            } else {
                resultObj[ciClassName] = {};
                resultObj[ciClassName][type] = typeObj;
            }
        }

        return resultObj;
    },

    /**
     * Returns ci sys_id with the type, either "cloud", "non_cloud" or "unknown"
     * @param {String} parentClassName  sys_class_name that given ciSysId roll up to
     * @param {String} ciSysIds    sys_id of CIs being looked up
     * @return {String} - type of ci
     */
    lookUpCisInQbResultTable: function(parentClassName, ciSysIds) {
        var result = {};
        for (var i = 0; i < ciSysIds.length; i++) {
            var ciSysId = ciSysIds[i];
            result[ciSysId] = this.APP_SVC_TYPES.UNKNOWN;
        }

        if (parentClassName === this.APP_SVC_TYPES.UNKNOWN) {
            return result;
        }

        var classResultTableMap = this.CLASS_QB_RESULT_TABLE_MAP[parentClassName];
        for (classType in classResultTableMap) {
            //classType is cloud or non_cloud
            var lookUpCol = classResultTableMap[classType].lookupCol;
            var lastExecution = classResultTableMap[classType].lastExecution;
            if (gs.tableExists(lastExecution.result_table)) {
                if (lastExecution.status == this.QB_STATUS.COMPLETE) {
                    //search for ciSysId in the result table lookup col name, only if last execution status is COMPLETE
                    var resultTableGr = new GlideRecord(lastExecution.result_table);
                    resultTableGr.addQuery(lookUpCol, "IN", ciSysIds);
                    resultTableGr.addQuery(this.COLS.QUERY, lastExecution.executionId);
                    resultTableGr.query();
                    while (resultTableGr.next()) {
                        var ciSysId = resultTableGr.getValue(lookUpCol);
                        result[ciSysId] = classType;
                    }
                }
            }
        }
        return result;
    },

    buildResultTablePrimaryCiMap: function() {
        var resultObj = {};
        var gr = new GlideRecord(this.TABLES.SN_CMDB_WS_QUERY_CATEGORY);
        gr.query();
        while (gr.next()) {
            var resultTable = gr.getElement(this.COLS.QUERY + this.COLS.DOT + this.COLS.RESULT_TABLE);
            var columnName = gr.getValue(this.COLS.CI_LOOKUP_COL);
            var className = gr.getValue(this.COLS.CI_CLASS_NAME);
            resultObj[resultTable] = {
                column_name: columnName,
                class_name: className
            };
        }
        return resultObj;
    },

    getDataCenterTypeOfCloudProvider: function(cloudProvider) {
        var gr = new GlideRecord(this.TABLES.SN_CMDB_WS_DATACENTER_TYPE);
        gr.addQuery(this.COLS.CLOUD_PROVIDER, cloudProvider);
        gr.query();

        return gr;
    },

    isValidRecord: function(table, encodedQuery, query) {
        var gr = new GlideRecord(table);
        if (encodedQuery) {
            gr.addEncodedQuery(encodedQuery, true);
        }
        if (query && Object.keys(query).length > 0) {
            for (var key in query) {
                gr.addQuery(key, query[key]);
            }
        }
        gr.setLimit(1);
        gr.query();

        return gr.hasNext();
    },

    migrateInsightDataRecords: function() {
        var insightDataGr = new GlideRecord(this.TABLES.SN_CMDB_WS_INSIGHT_DATA);
        insightDataGr.query();
        while (insightDataGr.next()) {
            var gr = new GlideRecord(this.TABLES.SN_CMDB_WS_PRODUCT_INSIGHT_DATA);
            gr.initialize();
            gr.setValue(this.COLS.CHART, this.CATEGORY.CLOUD_AND_NONCLOUD_CIS);
            gr.setValue(this.COLS.CI_CATEGORY, insightDataGr.getValue(this.COLS.CI_CATEGORY));
            gr.setValue(this.COLS.CLOUD_PROVIDER, insightDataGr.getValue(this.COLS.CLOUD_PROVIDER));
            gr.setValue(this.COLS.COUNT, insightDataGr.getValue(this.COLS.COUNT));
            gr.setValue(this.COLS.STATE, insightDataGr.getValue(this.COLS.STATE));

            gr.insert();
        }
    },
    /**
     * Returns a string known cloud parent class for a given class or unknown
     * @param {String} className    Name of class being looked up
     * @return {String}
     */
    lookUpCloudParent: function(className) {
        if (!this.CLOUD_PARENT_CACHE[className]) {
            var table = new GlideTableHierarchy(className);
            var tables = table.getTables();

            this.CLOUD_PARENT_CACHE[className] = this.APP_SVC_TYPES.UNKNOWN;

            for (ancestor in tables) {
                if (this.CLOUD_CLASSES[tables[ancestor]]) {
                    this.CLOUD_PARENT_CACHE[className] = tables[ancestor];
                    break;
                }
            }
        }
        return this.CLOUD_PARENT_CACHE[className];
    },

    type: 'CMDBWsInsightUtil'
});
