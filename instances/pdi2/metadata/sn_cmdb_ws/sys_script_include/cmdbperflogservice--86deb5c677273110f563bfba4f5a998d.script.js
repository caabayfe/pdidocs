var CMDBPerfLogService = Class.create();
CMDBPerfLogService.prototype = Object.extendsObject(CMDBPerfLoggingBase, {
    initialize: function() {
        
    },

    createSplunkLogEntry: function(perfOb, appName) {
        var splunkLogEntry = this._buildLogObject(perfOb);
        if(splunkLogEntry) {
            splunkLogEntry= "cmdb_app_name=" + appName + " " + splunkLogEntry;
            gs.info(splunkLogEntry);
        }
    },

    insertIntoUMPerfTable: function(logObject) {
        if(!logObject[this.PERF_METRIC_COLUMNS.CI_SYSID]){
            this.logErrorMessage(this.APP_NAME.UNIFIED_MAP, "CI SysId cannot be empty.");
        }

        try {
            var startTime = new GlideDateTime();
            startTime.setNumericValue(logObject[this.PERF_METRIC_COLUMNS.START_TIME]);
            var grUpdate = new GlideRecord(this.SN_CMDB_WS_UM_PERF_METRICS_TABLE);
            grUpdate.addQuery(this.PERF_METRIC_COLUMNS.START_TIME, startTime);
            grUpdate.addQuery(this.PERF_METRIC_COLUMNS.CI, logObject[this.PERF_METRIC_COLUMNS.CI_SYSID]);
            grUpdate.setLimit(1);
            grUpdate.query();
            if(grUpdate.next()) {
                this._setLogObject(grUpdate, logObject);
                grUpdate.update();
            }
            else {
                var gr = new GlideRecord(this.SN_CMDB_WS_UM_PERF_METRICS_TABLE);
                this._setLogObject(gr, logObject);
                gr.insert();
            }
            } catch (ex) {
                this.logErrorMessage(this.APP_NAME.UNIFIED_MAP, "Failed to insert/update log values into " + SN_CMDB_WS_UM_PERF_METRICS_TABLE + " table. " + ex.toString());
            }
    },

    _setLogObject: function(gr, logObject) {
		var startTime = new GlideDateTime();
        gr.setValue(this.PERF_METRIC_COLUMNS.BASE_STATE_TYPE ,logObject[this.PERF_METRIC_COLUMNS.BASE_STATE_TYPE] ? logObject[this.PERF_METRIC_COLUMNS.BASE_STATE_TYPE] : '');
        gr.setValue(this.PERF_METRIC_COLUMNS.CI, logObject[this.PERF_METRIC_COLUMNS.CI_SYSID]);
        gr.setValue(this.PERF_METRIC_COLUMNS.BROWSER, logObject[this.PERF_METRIC_COLUMNS.BROWSER] ? logObject[this.PERF_METRIC_COLUMNS.BROWSER] : '');
        gr.setValue(this.PERF_METRIC_COLUMNS.APP_ID, logObject[this.PERF_METRIC_COLUMNS.APP_ID] ? logObject[this.PERF_METRIC_COLUMNS.APP_ID] : '');
        gr.setValue(this.PERF_METRIC_COLUMNS.CMDB_FRONTEND_TIME,logObject[this.PERF_METRIC_COLUMNS.CMDB_FRONTEND_TIME] ? parseInt(logObject[this.PERF_METRIC_COLUMNS.CMDB_FRONTEND_TIME]) : 0);
        gr.setValue(this.PERF_METRIC_COLUMNS.CMDB_GETMAP_API_TIME,logObject[this.PERF_METRIC_COLUMNS.CMDB_GETMAP_API_TIME] ? parseInt(logObject[this.PERF_METRIC_COLUMNS.CMDB_GETMAP_API_TIME]) : 0);
        gr.setValue(this.PERF_METRIC_COLUMNS.CMDB_MAP_ONLY,logObject[this.PERF_METRIC_COLUMNS.CMDB_MAP_ONLY]  ? logObject[this.PERF_METRIC_COLUMNS.CMDB_MAP_ONLY] : false);
        gr.setValue(this.PERF_METRIC_COLUMNS.LEVELS, logObject[this.PERF_METRIC_COLUMNS.LEVELS]  ? logObject[this.PERF_METRIC_COLUMNS.LEVELS] : 0);
        gr.setValue(this.PERF_METRIC_COLUMNS.NODEMAP_COMPONENT_RENDERING_TIME, logObject[this.PERF_METRIC_COLUMNS.NODEMAP_COMPONENT_RENDERING_TIME] ? parseInt(logObject[this.PERF_METRIC_COLUMNS.NODEMAP_COMPONENT_RENDERING_TIME]) : 0);
        gr.setValue(this.PERF_METRIC_COLUMNS.NUMBER_OF_EDGES, logObject[this.PERF_METRIC_COLUMNS.NUMBER_OF_EDGES] ? logObject[this.PERF_METRIC_COLUMNS.NUMBER_OF_EDGES] : 0);
        gr.setValue(this.PERF_METRIC_COLUMNS.NUMBER_OF_NODES, logObject[this.PERF_METRIC_COLUMNS.NUMBER_OF_NODES] ? logObject[this.PERF_METRIC_COLUMNS.NUMBER_OF_NODES] : 0);
        gr.setValue(this.PERF_METRIC_COLUMNS.TOTAL_BACKEND_TIME, logObject[this.PERF_METRIC_COLUMNS.TOTAL_BACKEND_TIME] ? logObject[this.PERF_METRIC_COLUMNS.TOTAL_BACKEND_TIME] : 0);
        gr.setValue(this.PERF_METRIC_COLUMNS.SM_GETMAP_API_TIME, logObject[this.PERF_METRIC_COLUMNS.SM_GETMAP_API_TIME] ? logObject[this.PERF_METRIC_COLUMNS.SM_GETMAP_API_TIME] : 0);
        gr.setValue(this.PERF_METRIC_COLUMNS.TOTAL_ROUNDTRIP_TIME, logObject[this.PERF_METRIC_COLUMNS.TOTAL_ROUNDTRIP_TIME] ? logObject[this.PERF_METRIC_COLUMNS.TOTAL_ROUNDTRIP_TIME] : 0);
        gr.setValue(this.PERF_METRIC_COLUMNS.UXF_GETMAP_INBOUND_RETURN_TIME, logObject[this.PERF_METRIC_COLUMNS.UXF_GETMAP_INBOUND_RETURN_TIME] ? logObject[this.PERF_METRIC_COLUMNS.UXF_GETMAP_INBOUND_RETURN_TIME] : 0);
        gr.setValue(this.PERF_METRIC_COLUMNS.UXF_GETMAP_OUTBOUND_CALL_TIME, logObject[this.PERF_METRIC_COLUMNS.UXF_GETMAP_OUTBOUND_CALL_TIME] ? logObject[this.PERF_METRIC_COLUMNS.UXF_GETMAP_OUTBOUND_CALL_TIME] : 0);
		if(logObject[this.PERF_METRIC_COLUMNS.START_TIME]) {
			startTime.setNumericValue(logObject[this.PERF_METRIC_COLUMNS.START_TIME]);
		}
        gr.setValue(this.PERF_METRIC_COLUMNS.START_TIME, logObject[this.PERF_METRIC_COLUMNS.START_TIME] ? startTime : '');
    },

    type: 'CMDBPerfLogService'
});
