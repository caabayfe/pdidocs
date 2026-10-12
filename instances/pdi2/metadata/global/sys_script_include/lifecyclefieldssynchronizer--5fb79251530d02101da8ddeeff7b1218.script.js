var LifeCycleFieldsSynchronizer = Class.create();
LifeCycleFieldsSynchronizer.prototype = {
    startTime: null,
    logger: null,
    lifecycleUtil: new LifeCycleUtil(),
    jobCtxMgr: new CMDBJobContextManager(),
    tickPerMinute: 1,
    stats: {
        recordFetched: 0,
        recordUpdated: 0,
        totalTimeSpentOnFetchMs: 0,
        totalTimeSpentOnUpdateMs: 0,
        updateRatePerMin: 0,
        fetchRatePerMin: 0,
        processingRatePerMin: 0
    },
    initialize: function(iLogger) {
        if (iLogger)
            this.logger = iLogger;
        else
            this.logger = new GSLog(this.lifecycleUtil.LOG_LEVEL_PROPERTY, this.type);
    },
    MAX_EXECUTION_TIME: gs.getProperty("csdm.lifecycle.fields.synchronizer.job.execution.time",600000), //10 min
    ASSET_TABLE: "alm_asset",
    CMDB_CI: "cmdb_ci",
    SYS_ID: "sys_id",
    SYS_UPDATED_ON: "sys_updated_on",
    SYS_MOD_COUNT: "sys_mod_count",
    KEY: "csdm.lifecycle.fields.synchronizer.job.context",
    LOG_PER_MINUTE: 1, // update log after this many minute
    BATCH_SIZE: gs.getProperty("csdm.lifecycle.fields.synchronizer.job.batch.size",1000),
    /**
     * Method to synchronize the lifecycle field values between CI and Asset.
     * 
     * This method is re-invocable within the scheduled job!
     * 
     */
    run: function() {
        this.startTime = new GlideDateTime();
        var jobCtx = null;
        try {
            jobCtx = this._getJobContext();
            do {
                // get current mapping to process
                var currLifeCycleControl = jobCtx.orderedLifeCycleControlList[jobCtx.markerIndex];
                do {
                    var ciList = this._fetchNextBatch(currLifeCycleControl);
                    this._bulkUpdate(ciList, currLifeCycleControl.lifeCycleStage, currLifeCycleControl.lifeCycleStageStatus);

                    if (this._isTimeExpired(jobCtx))
                        return false;

                } while (currLifeCycleControl.isDoneProcessing === false);
                // All records have been processed for the current life cycle control, now process next one
                jobCtx.markerIndex += 1;
            } while (!this._isAllDone(jobCtx));
            // delete the marker so that we can reinvoke the job in future from the beginning
            this.logger.logInfo("JOB: " + this.type + " finished successfully. CSDM lifecycle fields are synchronized between CI and Asset" + ". Final state of Job Context:" + JSON.stringify(jobCtx));
            this.jobCtxMgr.deleteJobContext(this.KEY);
            return true;
        } catch (ex) {

            // On Error delete the job context
            this.logger.logErr("Error occurred in " + this.type + ". Clean up entry from cmdb_job_context table for KEY: " + this.KEY + " VALUE:" + JSON.stringify(jobCtx));
            this.jobCtxMgr.deleteJobContext(this.KEY);
            this.logger.logErr("ERROR:" + ex.message + " STACK_TRACE:" + ex.stack);
            throw ex;
        }
    },

    /**
     * This method returns true once all tables are processed.
     */
    _isAllDone: function(jobCtx) {
        return jobCtx.orderedLifeCycleControlList.length <= jobCtx.markerIndex;
    },

    _isTimeExpired: function(jobCtx) {
        //if 10 min elapsed break the processing
        var timeSpent = this._getTimeSpent();

        if (timeSpent > this.MAX_EXECUTION_TIME) {
            //save current state into job context
            this.jobCtxMgr.saveJobContext(this.KEY, "", JSON.stringify(jobCtx));
            this._logStats(timeSpent);
            this.logger.logInfo("Time expired for " + this.type + ". It will continue from where it left in next invocation of the JOB");
            //Return from here as next invocation of the JOB will continue processing remaining records
            return true;
        } else if (timeSpent > (this.LOG_PER_MINUTE * 60 * 1000) * this.tickPerMinute) {
            // print message after every specified min.
            this._logStats(timeSpent);
            this.tickPerMinute++;
        }
        return false;
    },

    _getTimeSpent: function(iTime) {
        var currTime = new GlideDateTime();
        var timeSpent = currTime.getNumericValue() - (iTime == undefined ? this.startTime.getNumericValue() : iTime.getNumericValue());
        return timeSpent;
    },

    _logStats: function(timeSpent) {
        var timeInMin = timeSpent / 60000;
        this.stats.processingRatePerMin = Math.round(this.stats.recordFetched / timeInMin);
        this.stats.updateRatePerMin = Math.round(this.stats.recordUpdated / (this.stats.totalTimeSpentOnUpdateMs / 60000));
        this.stats.fetchRatePerMin = Math.round(this.stats.recordFetched / (this.stats.totalTimeSpentOnFetchMs / 60000));
        this.logger.logInfo("Stats:" + JSON.stringify(this.stats));
    },

    /**
     * Single Update statement to update the lifecycle fields for the given ciList
     * @param {*} currMapping 
     * @param {*} ciList 
     * @returns 
     */
    _bulkUpdate: function(ciList, lifeCycleStage, lifeCycleStageStatus) {
        if (ciList == null || ciList.length == 0)
            return;
        var startTime = new GlideDateTime();
        //Bulk Update(GlideMultipleUpdate) all items if the lifecycle fields are not matching
        var gmu = new GlideMultipleUpdate(this.CMDB_CI);
        gmu.addSetQuery(this.SYS_ID, ciList);
        gmu.setValue(this.lifecycleUtil.LIFE_CYCLE_STAGE, lifeCycleStage);
        gmu.setValue(this.lifecycleUtil.LIFE_CYCLE_STAGE_STATUS, lifeCycleStageStatus);
        gmu.setValue(this.SYS_UPDATED_ON, new GlideDateTime().getValue());
        gmu.setIncrement(this.SYS_MOD_COUNT, 1); //Increment the mod count
        gmu.execute();

        this.stats.totalTimeSpentOnUpdateMs += this._getTimeSpent(startTime);
        this.stats.recordUpdated += ciList.length;
    },

    _fetchNextBatch: function(lifeCycleControlInfo) {
        var startTime = new GlideDateTime();
        var ciList = [];
        //Get next 1000 CIs
        var tableGr = this._getGlideRecordWithFilter(lifeCycleControlInfo);

        while (tableGr.next()) {
            var ci = tableGr.getValue("ci");
            if (!gs.nil(ci))
                ciList.push(ci);
        }

        if (tableGr.getRowCount() > 0)
            lifeCycleControlInfo.lastSysId = tableGr.getValue(this.SYS_ID);

        lifeCycleControlInfo.totalRow = (lifeCycleControlInfo.totalRow ? lifeCycleControlInfo.totalRow : 0) + tableGr.getRowCount();
        this.stats.totalTimeSpentOnFetchMs += this._getTimeSpent(startTime);
        this.stats.recordFetched += tableGr.getRowCount();
        return ciList;
    },

    _getGlideRecordWithFilter: function(lifeCycleControlInfo) {
        var tableGr = new GlideRecord(this.ASSET_TABLE);
        tableGr.addQuery("life_cycle_stage", lifeCycleControlInfo.lifeCycleStage);
        tableGr.addQuery("life_cycle_stage_status", lifeCycleControlInfo.lifeCycleStageStatus);

        if (!gs.nil(lifeCycleControlInfo.lastSysId))
            tableGr.addQuery(this.SYS_ID, ">", lifeCycleControlInfo.lastSysId);

        tableGr.setLimit(this.BATCH_SIZE);
        tableGr.orderBy(this.SYS_ID);
        tableGr.query();
        if (tableGr.getRowCount() < this.BATCH_SIZE)
            lifeCycleControlInfo.isDoneProcessing = true;
        else
            lifeCycleControlInfo.isDoneProcessing = false;
        return tableGr;
    },

    _getJobContext: function() {
        var jobCtx = this.jobCtxMgr.getJobContextJSONValue(this.KEY);
        if (jobCtx) {
            this.logger.logInfo("Reoccurrence of:" + this.type + " Job. Resuming from last markerIndex:" + jobCtx.markerIndex);
            if (gs.nil(jobCtx.markerIndex)) {
                var errMsg = "Invalid state for lifecycle fields sync between CI and Asset!!";
                this.logger.logErr(errMsg);
                throw new Error(errMsg); //throw error so that we can stop processing and deactivate job
            }
        } else {
            // First occurrence of the Job. Initialize cmdb_job_context table and set the marker
            jobCtx = this._initializeJobContext();
            this.logger.logInfo("First occurrence of:" + this.type + " Job");
        }
        return jobCtx;
    },

    /**
     * Initialize the job context before we start the updating the CI lifecycle values from asset
     */
    _initializeJobContext: function() {
        var jobCtx = {
            markerIndex: 0,
            orderedLifeCycleControlList: []
        };

        var grCnt = this._getLifecycleControlListForAsset(jobCtx.markerIndex);
        while (grCnt.next()) {
            var controlObj = {};
            controlObj.sysId = grCnt.getValue(this.SYS_ID);
            controlObj.lifeCycleStage = grCnt.getValue(this.lifecycleUtil.LIFE_CYCLE_STAGE);
            controlObj.lifeCycleStageStatus = grCnt.getValue(this.lifecycleUtil.LIFE_CYCLE_STAGE_STATUS);
            controlObj.isDoneProcessing = false;
            controlObj.lastSysId = "";
            controlObj.totalRow = 0;
            jobCtx.orderedLifeCycleControlList.push(controlObj);
        }
        this.jobCtxMgr.saveJobContext(this.KEY, "", JSON.stringify(jobCtx));
        return jobCtx;
    },

    /**
     * Get list of lifecycle controls for asset table.
     * Note: This table stores the possible valid combination of life cycle stage and status value.
     */
    _getLifecycleControlListForAsset: function() {
        var grCnt = new GlideRecord(this.lifecycleUtil.LIFE_CYCLE_CTRL_TABLE);
        grCnt.addActiveQuery();
        grCnt.addQuery("table.name", "STARTSWITH", this.ASSET_TABLE);
        grCnt.addOrderBy(this.SYS_ID);
        grCnt.query();
        return grCnt;
    },
    type: 'LifeCycleFieldsSynchronizer'
};
