var LifeCycleBulkPopulateUtil = Class.create();
LifeCycleBulkPopulateUtil.prototype = {
    startTime: null,
    logger: null,
    lifecycleUtil: new LifeCycleUtil(),
    jobCtxMgr: new CMDBJobContextManager(),
    tickPerMinute: 1,
	jobCtxRef: null,
    stats: {
        recordFetched: 0,
        recordUpdated: 0,
        totalTimeSpentOnFetchMs: 0,
        totalTimeSpentOnUpdateMs: 0,
        updateRatePerMin: 0,
        fetchRatePerMin: 0,
        processingRatePerMin: 0
    },
    onlyForNonAssetCI: false,
    processOnlyTBD: false,
    initialize: function(iLogger) {
        if (iLogger)
            this.logger = iLogger;
        else
            this.logger = new GSLog(this.lifecycleUtil.LOG_LEVEL_PROPERTY, this.type);
    },
    MAX_EXECUTION_TIME: gs.getProperty("csdm.life.cycle.bulk.population.job.execution.time", 600000), //10 min
    SYS_ID: "sys_id",
    SYS_UPDATED_ON: "sys_updated_on",
    SYS_MOD_COUNT: "sys_mod_count",
    KEY: "csdm.life.cycle.bulk.population.job.context",
    LOG_PER_MINUTE: 1, // update log after this many minute
    BATCH_SIZE: gs.getProperty("csdm.life.cycle.bulk.population.job.batch.size", 1000),
    EQUAL_TOKEN: "=",
    JOIN_TOKEN: "^",
    TBD_GROUP: "TBD_GROUP",
    /**
     * Method to invoke bulk populate Life cycle values using the legacy values.
     * 
     * This method is re-invocable within the scheduled job!
     * 
     * @rootTable: If rootTable is passed, run the Life cycle bulk populate only for the table extend from the root. If no value passed for rootTable, bulk populate runs for all tables having Life cycle mapping.   
     */
    run: function(rootTable) {
        this.startTime = new GlideDateTime();
		var jobCtx = null;
        try {
            jobCtx = this._getJobContext(rootTable);
			this.jobCtxRef = jobCtx;
            do {
                // get current mapping to process
                var currTable = jobCtx.orderedTableList[jobCtx.markerIndex];
                var currTableInfo = jobCtx.tableMap[currTable];
                do {
                    var groups = this._fetchNextBatch(currTableInfo);
                    for (var g in groups)
                        this._bulkUpdate(currTable, groups[g]);

                    if (this._isTimeExpired(jobCtx)) {
                        return false;
                    }
                } while (currTableInfo.isDoneProcessing === false);
                // all records have been processed for the current table, now process next one
                jobCtx.markerIndex += 1;
            } while (!this._isAllDone(jobCtx));
            // once everything is done set the flag off
            this._setBulkPopulationStatus(false);
            this.jobCtxMgr.deleteJobContext(this.KEY);
            this.logger.logInfo("JOB: " + this.type + " finished successfully. Bulk population of CSDM Life cycle fields is completed" + (!gs.nil(rootTable) ? " for all tables extended from " + rootTable : "") + ". Final state of Job Context:" + JSON.stringify(jobCtx));
            return true;
        } catch (ex) {
            // On Error delete the job context
            this.logger.logErr("Error occurred in " + this.type + ". Clean up entry from cmdb_job_context table for KEY: " + this.KEY + " VALUE:" + JSON.stringify(jobCtx));
            this.jobCtxMgr.deleteJobContext(this.KEY);
            this.logger.logErr("ERROR:" + ex.message + " STACK_TRACE:" + ex.stack);
            throw ex;
        }
    },

    _isTimeExpired: function(jobCtx) {
        //if 10 min elapsed break the processing
        var timeSpent = this._getTimeSpent();

        if (timeSpent > this.MAX_EXECUTION_TIME) {
            //save current state into job context
            this.jobCtxMgr.saveJobContext(this.KEY, "", JSON.stringify(jobCtx));
            this._logStats(timeSpent);
            this.logger.logInfo("Time expired for LifeCycleBulkPopulateUtil. It will continue from where it left in next invocation of the JOB");
            //Return from here as next invocation of the JOB will continue processing remaining records
            return true;
        } else if (timeSpent > (this.LOG_PER_MINUTE * 60 * 1000) * this.tickPerMinute) {
            // print message after every specified min.
            this._logStats(timeSpent);
            this.tickPerMinute++;
        }
        return false;
    },

    _logStats: function(timeSpent) {
        var timeInMin = timeSpent / 60000;
        this.stats.processingRatePerMin = Math.round(this.stats.recordFetched / timeInMin);
        this.stats.updateRatePerMin = Math.round(this.stats.recordUpdated / (this.stats.totalTimeSpentOnUpdateMs / 60000));
        this.stats.fetchRatePerMin = Math.round(this.stats.recordFetched / (this.stats.totalTimeSpentOnFetchMs / 60000));
        this.logger.logInfo("Stats:" + JSON.stringify(this.stats));
    },

    _getJobContext: function(rootTable) {
        var jobCtx = this.jobCtxMgr.getJobContextJSONValue(this.KEY);
        if (jobCtx) {
            // reoccurrence: bulk process has been already initiated
            this.logger.logInfo("Reoccurrence of:" + this.type + " Job. Resuming from last markerIndex:" + jobCtx.markerIndex);
        } else {
            // First occurrence of the Job. Initialize cmdb_job_context table and set the flag
            jobCtx = this._initializeJobContext(rootTable);
            this.logger.logInfo("First occurrence of:" + this.type + " Job. Starting bulk population of CSDM Life cycle fields" + (!gs.nil(rootTable) ? " for all tables extended from " + rootTable : ""));
        }
        if (jobCtx.orderedTableList.length == 0) {
            // May be no mapping exist to process for the given root table
            var errMsg = "CSDM mappings not found to bulk populate" + (!gs.nil(rootTable) ? (" for rootTable:" + rootTable) : "");
            this.logger.logErr(errMsg);
            throw new Error(errMsg); //throw error so that we can stop processing and deactivate job
        }
        return jobCtx;
    },

    /**
     * This method returns true once all tables are processed.
     */
    _isAllDone: function(jobCtx) {
        return jobCtx.orderedTableList.length <= jobCtx.markerIndex;
    },

    /**
     * Fetch next 1k records from the current table in the ordered list.
     * 
     * It fetches records where Life cycle fields are null OR TBD order by sys_id and finds the mapping for the field and subfield value for each row.
     * returns: Groups of sysIds with the mapping
     */
    _fetchNextBatch: function(currTableInfo) {
        var startTime = new GlideDateTime();
        // Grab next upto 1K records from current table
        var tableGr = this._getGlideRecordWithFilter(currTableInfo);
        var groups = []; // Note: we may not have any records to process for the given table
        var count = 0;

        //loop through the records.
        while (tableGr.next()) {
            if (this.onlyForNonAssetCI === true && !gs.nil(tableGr.getValue("asset")))
                continue; //skip the CI if asset is not empty

			//find the mapping rule that applies to the record
			var mapping = this._getMapping(tableGr, currTableInfo);
			if(mapping == null) {
				//If could not find mapping for current table then look for parents mapping
				var parents = this._getParents(currTableInfo.table_name);
				for(var indx = 0; indx < parents.length; indx++) {
					var parent = parents[indx];
					var parentTableInfo = this.jobCtxRef.tableMap[parent];
					if(parentTableInfo) {
						mapping = this._getMapping(tableGr, parentTableInfo);
						if(mapping != null)
							break;
					}
				}
			}

            //Add record into group
            this._addRecordIntoGroup(tableGr, mapping, groups);

            count++;
        }

        if (tableGr.getRowCount() > 0) {
            currTableInfo.lastSysId = tableGr.getValue(this.SYS_ID);
            currTableInfo.lastSysUpdatedOn = tableGr.getValue(this.SYS_UPDATED_ON);
        }

        currTableInfo.totalRow = (currTableInfo.totalRow ? currTableInfo.totalRow : 0) + tableGr.getRowCount();
        this.stats.totalTimeSpentOnFetchMs += this._getTimeSpent(startTime);
        this.stats.recordFetched += tableGr.getRowCount();

        return groups;
    },

    _addRecordIntoGroup: function(tableGr, mapping, groups) {
        var mapID = null;
        if (mapping)
            mapID = mapping.ID;
        else {
            mapID = this.TBD_GROUP;
            mapping = {
                lifeCycleStage: this.lifecycleUtil.TBD_VAL.life_cycle_stage,
                lifeCycleStageStatus: this.lifecycleUtil.TBD_VAL.life_cycle_stage_status,
            };
        }
        if (groups[mapID]) {
            groups[mapID].sysIdList.push(tableGr.getValue(this.SYS_ID));
        } else {
            var group = {
                sysIdList: [tableGr.getValue(this.SYS_ID)],
                mapping: mapping
            };
            groups[mapID] = group;
        }
    },

    _getTimeSpent: function(iTime) {
        var currTime = new GlideDateTime();
        var timeSpent = currTime.getNumericValue() - (iTime == undefined ? this.startTime.getNumericValue() : iTime.getNumericValue());
        return timeSpent;
    },

    _getGlideRecordWithFilter: function(currTableInfo) {
        var tableGr = new GlideRecord(currTableInfo.table_name);
        if (this.processOnlyTBD === true) {
            tableGr.addQuery(this.lifecycleUtil.LIFE_CYCLE_STAGE, this.lifecycleUtil.TBD_VAL.life_cycle_stage);
            if (!gs.nil(currTableInfo.lastSysUpdatedOn))
                tableGr.addQuery(this.SYS_UPDATED_ON, ">=", currTableInfo.lastSysUpdatedOn);
            if (!gs.nil(currTableInfo.lastSysId))
                tableGr.addQuery(this.SYS_ID, ">", currTableInfo.lastSysId);
            tableGr.orderBy(this.SYS_UPDATED_ON);
            tableGr.orderBy(this.SYS_ID);
        } else {
            tableGr.addEncodedQuery("life_cycle_stageISEMPTY");
            if (!gs.nil(currTableInfo.lastSysId))
                tableGr.addQuery(this.SYS_ID, ">", currTableInfo.lastSysId);
            tableGr.orderBy(this.SYS_ID);
        }

        tableGr.setLimit(this.BATCH_SIZE);

        tableGr.query();
        if (tableGr.getRowCount() < this.BATCH_SIZE)
            currTableInfo.isDoneProcessing = true;
        else
            currTableInfo.isDoneProcessing = false;
        return tableGr;
    },

    _getMapping: function(tableGr, tableInfo) {
        var finalMapping = null;
        var fieldCombos = Object.keys(tableInfo.field_combo);
        for (var i = 0; i < fieldCombos.length; i++) {
            var fieldComboArr = fieldCombos[i].split(this.JOIN_TOKEN);
            var field = fieldComboArr[0];
            var fieldVal = tableGr.getValue(field);

            var subfield = fieldComboArr.length > 1 ? fieldComboArr[1] : null;
            var subfieldVal = gs.nil(subfield) ? null : tableGr.getValue(subfield);

            var lookupKey = field + this.EQUAL_TOKEN + fieldVal;
            if (subfield)
                lookupKey += this.JOIN_TOKEN + subfield + this.EQUAL_TOKEN + (subfieldVal ? subfieldVal : "");

            var mapping = tableInfo.lookup_map[lookupKey];
            if (mapping == null)
                continue; // Mapping may not exists for given value combination of field and subfield
            else {
                if (finalMapping == null)
                    finalMapping = mapping;
                else if (mapping.priority < finalMapping.priority)
                    finalMapping = mapping; // lower the value higher the priority 
            }
        }
        return finalMapping;
    },

    /**
     * Single Update statement to update the Life cycle fields for the given sysIdList
     * @returns 
     */
    _bulkUpdate: function(tableName, group) {
        var mapping = group.mapping;
        var sysIdList = group.sysIdList;
        var lifeCycleStage = mapping.lifeCycleStage;
        var lifeCycleStageStatus = mapping.lifeCycleStageStatus;

        if (sysIdList == null || sysIdList.length == 0)
            return;

        var startTime = new GlideDateTime();
        //Bulk Update(GlideMultipleUpdate) all items
        var gmu = new GlideMultipleUpdate(tableName);
        gmu.addSetQuery(this.SYS_ID, sysIdList);
        gmu.setValue(this.lifecycleUtil.LIFE_CYCLE_STAGE, lifeCycleStage);
        gmu.setValue(this.lifecycleUtil.LIFE_CYCLE_STAGE_STATUS, lifeCycleStageStatus);
        gmu.setValue(this.SYS_UPDATED_ON, new GlideDateTime().getValue());
        gmu.setIncrement(this.SYS_MOD_COUNT, 1); //Increment the mod count
        gmu.execute();

        this.stats.totalTimeSpentOnUpdateMs += this._getTimeSpent(startTime);
        this.stats.recordUpdated += sysIdList.length;
    },

    /**
     * Initialize the job context before we start the bulk population for CSDM Life cycle fields
     * @param {*} @rootTable: If rootTable is passed, consider the CSDM mapping only for those tables extend from the root. 
     * If no value passed for rootTable, return CSDM mappings for all tables.   
     */
    _initializeJobContext: function(rootTable) {
        // Get list of tables
        var mappedTables = JSON.parse(SNC.CSDMLifeCycleMappingCacheManager.getUniqueTables());
        var countMap = {};
        var manager = GlideDBObjectManager.get();
        var extendedTables = null;
        if (!gs.nil(rootTable))
            extendedTables = manager.getTableExtensions(rootTable);

        for (var i = 0; i < mappedTables.length; i++) {
            // If rootTable is passed, run the Life cycle bulk populate only for the table extend from the root
            if (!(gs.nil(rootTable) || rootTable == mappedTables[i] || extendedTables.contains(mappedTables[i])))
                continue;

            var parents = this._getParents(mappedTables[i]);
            var index = parents.length;
            if (!countMap[index])
                countMap[index] = [];

            countMap[index].push(mappedTables[i]);
        }

        // Now sort count map
        var tableArray = [];
        Object.keys(countMap).sort().reverse().forEach(function(key) {
            tableArray.push(countMap[key]);
        });

        // Now loop
        var orderedTableList = []; // We will process tables in the order they are defined in the orderedTableList
        var tableMap = {}; // Map of table to its mapping rule
        for (var j = 0; j < tableArray.length; j++) {
            var tableNames = tableArray[j];
            for (var k = 0; k < tableNames.length; k++) {
                var aTable = tableNames[k];
                orderedTableList.push(aTable);
                var tableInfo = {
                    table_name: aTable,
                    field_combo: {},
                    lookup_map: {}
                };
                tableMap[aTable] = tableInfo;

                var mappings = JSON.parse(SNC.CSDMLifeCycleMappingCacheManager.getMappingForTable(aTable));
                for (var rec = 0; rec < mappings.length; rec++) {

                    var field_combo_key = mappings[rec].legacy_field_name;
                    var lookup_key = mappings[rec].legacy_field_name + this.EQUAL_TOKEN + mappings[rec].legacy_field_value;
                    if (mappings[rec].legacy_subfield_name) {
                        field_combo_key += this.JOIN_TOKEN + mappings[rec].legacy_subfield_name;
                        lookup_key += this.JOIN_TOKEN + mappings[rec].legacy_subfield_name + this.EQUAL_TOKEN +
                            (mappings[rec].legacy_subfield_value ? mappings[rec].legacy_subfield_value : "");
                    }

                    var obj = {};
                    obj.ID = new GlideDigest().md5_digest(JSON.stringify(mappings[rec]));
                    obj.tableName = aTable;
                    obj.legacyField = mappings[rec].legacy_field_name;
                    obj.legacyFieldVal = mappings[rec].legacy_field_value;
                    obj.legacySubfield = mappings[rec].legacy_subfield_name;
                    obj.legacySubfieldVal = mappings[rec].legacy_subfield_value;
                    obj.lifeCycleStage = mappings[rec].life_cycle_stage;
                    obj.lifeCycleStageStatus = mappings[rec].life_cycle_stage_status;
                    obj.priority = mappings[rec].priority;

                    tableInfo.field_combo[field_combo_key] = true;
                    tableInfo.lookup_map[lookup_key] = obj;
                }
            }
        }
        var jobCtx = {
            orderedTableList: orderedTableList,
            tableMap: tableMap,
            markerIndex: 0
        };

        this.jobCtxMgr.saveJobContext(this.KEY, "", JSON.stringify(jobCtx));
        // Set the bulk population flag to "true" to prevent bulk reverse-sync of legacy fields
        this._setBulkPopulationStatus(true);
        return jobCtx;
    },

    runOnlyForNonAssetCI: function() {
        this.onlyForNonAssetCI = true;
    },
    runOnlyForTBD: function() {
        this.processOnlyTBD = true;
    },

    _getParents: function(tableName) {
        var manager = GlideDBObjectManager.get();
        var parents = [];

        // Note: getBase() method return table itself as parent for root table in table hierarchy
        // for example alm_asset, this method returns alm_asset as parent.
        var parent = manager.getBase(tableName) + "";
        var lastParent = "";

        while (parent != lastParent && tableName != parent) {
            parents.push(parent);
            lastParent = parent;
            parent = manager.getBase(lastParent) + "";
        }
        return parents;
    },

    /**
     * Set the bulk population sys_property to the given value
     * @param {*} value 
     */
    _setBulkPopulationStatus: function(value) {
        var gr = new GlideRecord('sys_properties');
        gr.addQuery('name', this.lifecycleUtil.CSDM_LIFE_CYCLE_BULK_POPULATION_ACTIVE);
        gr.query();

        if (gr.next()) {
            gr.setValue('value', value);
            gr.update();
        } else {
            gs.warn(gs.getMessage("Unable to update property: {0}", [this.lifecycleUtil.CSDM_LIFE_CYCLE_BULK_POPULATION_ACTIVE]));
        }
    },

    type: 'LifeCycleBulkPopulateUtil'
};
