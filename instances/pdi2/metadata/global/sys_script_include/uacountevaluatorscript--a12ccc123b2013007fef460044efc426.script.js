var UACountEvaluatorScript = Class.create();
UACountEvaluatorScript.prototype = {
    initialize: function() {
        this.UA_STATS_DEFN_TABLE = "ua_stats_defn";
        this.USAGEANALYTICS_COUNT_CFG_TABLE = "usageanalytics_count_cfg";
        this.UA_SCRIPTED_DEFN_TABLE = "ua_scripted_defn";
        this.KB_LINK = "<a href = 'https://support.servicenow.com/kb?id=kb_article_view&sysparm_article=KB0547260' target='_blank'>KB0547260</a>";
        this.CS_HELP_MESSAGE = gs.getMessage("Reach out to customer support using this {0} to get this resolved.", this.KB_LINK);
        this.EMPTY_RESULT_MESSAGE = gs.getMessage("No result returned")
        this.INVALID_TABLE_MESSAGE = gs.getMessage("Invalid TABLE NAME");
        this.INVALID_QUERY_MESSAGE = gs.getMessage("Invalid QUERY");
        this.INVALID_GROUPBY_MESSAGE = gs.getMessage("Invalid GROUPBY column");
        this.INVALID_AGG_COL_MESSAGE = gs.getMessage("Invalid AGGREGATION column");
        this.INVALID_HAVING_MESSAGE = gs.getMessage("Invalid HAVING clause");
        this.INVALID_SCRIPT_MESSAGE = gs.getMessage("Invalid SCRIPT");
        this.COUNT_KEY_MISSING_MESSAGE = gs.getMessage("JSON result doesn't contain COUNT key");
        this.EXECUTION_CANCELLED_MESSAGE = gs.getMessage("This definition breached the execution threshold of {0} ms");
        this.INVALID_SYS_METADATA_CHILD_TABLE = gs.getMessage("Invalid table name,it must be a child of sys_metadata table");
        this.INVALID_JOIN_TABLE = gs.getMessage("Invalid Join table name");
        this.INVALID_JOIN_COLUMN = gs.getMessage("Invalid Join column in Main table");
        this.INVALID_JOIN_TABLE_COLUMN = gs.getMessage("Invalid Join column in Join table");
        this.INVALID_SYS_METADATA_CUSTOMIZATION_TABLE = gs.getMessage("Table sys_metadata_customization not present");
    },

    execute: function(current) {
        var tableName = current.getTableName();
        if (!this._isValidUATable(tableName))
            return;

        var result = new SNC.UsageAnalyticsScriptUtils().getExecutionStats(current);
        var jsonObj = JSON.parse(result);
        var msg = gs.getMessage('Result: ');

        if (gs.nil(jsonObj) || this._isJsonResultEmpty(jsonObj)) {
            msg += this.EMPTY_RESULT_MESSAGE;
            gs.addInfoMessage(msg);
            gs.addInfoMessage(this.CS_HELP_MESSAGE);
        } else {
            var count = jsonObj.count;
            var aggData = jsonObj.ua_defn_agg;
            var executionCancelThreshold = jsonObj.execution_cancel_threshold;
            var executionTime = jsonObj.executiontime;

            if (!gs.nil(executionTime))
                msg += gs.getMessage('Time taken to execute (ms): {0}, ', executionTime);

            if (!gs.nil(count))
                msg += this._getCountResultMessage(count, tableName, executionCancelThreshold);

            gs.addInfoMessage(msg);

            if (!gs.nil(count) && count < 0)
                gs.addInfoMessage(this.CS_HELP_MESSAGE);

            if (!gs.nil(aggData) && gs.hasRole('maint'))
                gs.addInfoMessage(this._getInfoMessageForAggData());
        }

        if (!gs.hasRole('maint'))
            this._recordUsage(current);

        action.setRedirectURL(current);
    },

    _isJsonResultEmpty: function(jsonObj) {
        return Object.keys(jsonObj).length === 0;
    },

    _isValidUATable: function(tableName) {
        return !gs.nil(tableName) && (tableName === this.UA_STATS_DEFN_TABLE || tableName === this.USAGEANALYTICS_COUNT_CFG_TABLE || tableName === this.UA_SCRIPTED_DEFN_TABLE);
    },

    _getCountResultMessage: function(count, tableName, executionCancelThreshold) {
        var countResultMsg = gs.getMessage('Returned Count: {0}, ', count);
        if (count < 0)
            countResultMsg += this._getNegativeCountInfoMsg(count, tableName, executionCancelThreshold);
        return countResultMsg;
    },

    _getNegativeCountInfoMsg: function(count, tableName, executionCancelThreshold) {
        if (tableName == this.UA_STATS_DEFN_TABLE)
            return this._getTableStatsDefnNegativeCountInfo(count, executionCancelThreshold);
        else
            return this._getScriptedDefnNegativeCountInfo(count, executionCancelThreshold);
    },

    _getTableStatsDefnNegativeCountInfo: function(count, executionCancelThreshold) {
        switch (count) {
            case -1:
                return this.INVALID_TABLE_MESSAGE;
            case -2:
                return this.INVALID_QUERY_MESSAGE;
            case -3:
                return this.INVALID_GROUPBY_MESSAGE;
            case -4:
                return this.INVALID_AGG_COL_MESSAGE;
            case -5:
                return this.INVALID_HAVING_MESSAGE;
            case -6:
                return gs.getMessage(this.EXECUTION_CANCELLED_MESSAGE, executionCancelThreshold);
            case -8:
                return this.INVALID_SYS_METADATA_CHILD_TABLE;
            case -9:
                return this.INVALID_JOIN_TABLE;
            case -10:
                return this.INVALID_JOIN_COLUMN;
            case -11:
                return this.INVALID_JOIN_TABLE_COLUMN;
            case -12:
                return this.INVALID_SYS_METADATA_CUSTOMIZATION_TABLE;
        }
    },

    _getScriptedDefnNegativeCountInfo: function(count, executionCancelThreshold) {
        switch (count) {
            case -1:
                return this.INVALID_SCRIPT_MESSAGE;
            case -6:
                return gs.getMessage(this.EXECUTION_CANCELLED_MESSAGE, executionCancelThreshold);
            case -7:
                return this.COUNT_KEY_MISSING_MESSAGE;
        }
    },

    _getInfoMessageForAggData: function() {
        var href = "<a href = '/syslog_list.do?sysparm_query=sys_created_on%3E%3Djavascript%3Ags.beginningOfLastMinute()%5Esource%3Dua_defn_agg&sysparm_view='>here</a>";
        var aggDataMsg = gs.getMessage("Click {0} to view aggregate data", href);
        return aggDataMsg;
    },

    _recordUsage: function(current) {
        var sampleMap = new GCFSampleMap();
        sampleMap.put('definition_id', current.getValue("definition_id"));
        sampleMap.put('table_name', current.getTableName());
        GCFCollector.recordUsageEvent('subscription_management', 'definition', 'execute', sampleMap);
    },
    type: 'UACountEvaluatorScript'
};
