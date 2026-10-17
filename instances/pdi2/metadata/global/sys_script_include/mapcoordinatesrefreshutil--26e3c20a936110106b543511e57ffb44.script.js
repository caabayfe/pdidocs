var MapCoordinatesRefreshUtil = Class.create();
MapCoordinatesRefreshUtil.prototype = {
    initialize: function() {
        this.TABLE_LATLANG_REFRESH_CONFIG = "cmn_coordinate_refresh_config";
        var duration = parseInt(gs.getProperty("google.maps.refresh.latlong.duration", 25)) || 25;
        this.DURATION_REFRESH_LATLONG = duration >= 30 ? 29 : duration;
        this.COUNT_RECORDS_PROCESSED_PER_TABLE_PER_REFRESH = parseInt(gs.getProperty("google.maps.refresh.latlong.record_count_per_table", 500)) || 500;
    },

    refreshLatLongUsingConfigTable: function() {
        var tablesMapConfigSysIDs = [];
        var tablesGr = new GlideRecord(this.TABLE_LATLANG_REFRESH_CONFIG);
        tablesGr.addActiveQuery();
        tablesGr.query();
        while (tablesGr.next()) {
            tablesMapConfigSysIDs.push(tablesGr.getValue('sys_id'));
        }
        this._callExecutorForConfig(tablesMapConfigSysIDs);
    },

    _callExecutorForConfig: function(configSysIDs) {
        configSysIDs.forEach(function(item) {
            var gr = new GlideRecord(this.TABLE_LATLANG_REFRESH_CONFIG);
            gr.get(item);
            if (gr.isValidRecord()) {
                this.invokeLatLongRefreshForTable(gr);
            }
        }, this);
    },

    invokeLatLongRefreshForTable: function(configGr) {
	var table = configGr.getValue('data_table'),
	lastUpdatedFieldName = configGr.getValue('coordinates_retrieved_on');
        var tableGr = new GlideRecord(table);
        var recordIds = [];
        var dateTime = (new GlideDateTime());
        dateTime.addDays(-1 * this.DURATION_REFRESH_LATLONG);
        tableGr.addEncodedQuery(lastUpdatedFieldName + "!=NULL^" + lastUpdatedFieldName + "<=javascript:gs.dateGenerate('" + dateTime.getDate() + "', '" + dateTime.getDisplayValue().replace(dateTime.getDate() + " ", "") + "')");
        tableGr.setLimit(this.COUNT_RECORDS_PROCESSED_PER_TABLE_PER_REFRESH);
        tableGr.query();
        while (tableGr.next()) {
            recordIds.push(tableGr.getValue('sys_id')); //to avoid holding GlideRecords/resultSet in memory for long duration
        }
        for (var i = 0; i < recordIds.length; i++) {
            this._processLatLongRefreshForRecord(recordIds[i], configGr);
        }
    },

    _processLatLongRefreshForRecord: function(targetRecordID, configGr) {
        var address = "";
        var recordGr = new GlideRecord(configGr.getValue('data_table'));
        recordGr.get(targetRecordID);
        if (!recordGr.isValidRecord()) {
            return;
        }
        try {
            address = new GlideScopedEvaluator().evaluateScript(configGr, 'script', {
                current: recordGr
            });
        } catch (e) {
            gs.log("Invalid address to fetch the LatLong using google maps for table " + configGr.getValue('data_table') + " for SysID " + targetRecordID);
            address = "";
        }
        if (!address) {
            return;
        }
        var latLang = GoogleMapsHelper.google_getLatLong(address);
        gs.sleep(200); //pausing for 200ms inorder to not exceed RateLimit
        if (latLang && latLang[0] && latLang[1]) {
            recordGr[configGr.latitude_field] = latLang[0];
            recordGr[configGr.longitude_field] = latLang[1];
            recordGr[configGr.coordinates_retrieved_on] = new GlideDateTime().getDisplayValue();
        }
        // To make sure we dont update records and fire notifications, rules, engines. Doing a silent update 
        recordGr.setWorkflow(false);
        recordGr.setUseEngine(false);
        recordGr.autoSysFields(false);
        // end of silent update settings
        recordGr.update();
    },

    type: 'MapCoordinatesRefreshUtil'
};
