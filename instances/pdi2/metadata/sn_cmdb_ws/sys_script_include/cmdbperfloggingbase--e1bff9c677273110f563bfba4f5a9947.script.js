var CMDBPerfLoggingBase = Class.create();
CMDBPerfLoggingBase.prototype = {
    initialize: function() {
    },

    SN_CMDB_WS_UM_PERF_METRICS_TABLE : 'sn_cmdb_ws_um_perf_metrics',
    APP_NAME : {
        UNIFIED_MAP : "Unified Map",
        UNIFIED_MAP_KEY : "UnifiedMap"
    },
    PERF_METRIC_COLUMNS : {
        BASE_STATE_TYPE: 'base_state_type',
        CI: 'ci',
        CI_NAME: 'ci_name',
        CI_SYSID: 'ci_sysid',
        CMDB_FRONTEND_TIME: 'cmdb_frontend_time',
        CMDB_GETMAP_API_TIME: 'cmdb_getmap_api_time', 
        CMDB_MAP_ONLY: 'cmdb_map_only',
        LEVELS: 'levels',
		CI_LEVELS: 'cilevels',
        NODEMAP_COMPONENT_RENDERING_TIME: 'nodemap_component_rendering_time',
        NUMBER_OF_EDGES: 'number_of_edges',
        NUMBER_OF_NODES: 'number_of_nodes',
        TOTAL_BACKEND_TIME: 'total_backend_time', 
        SM_GETMAP_API_TIME: 'sm_getmap_api_time',
        TOTAL_ROUNDTRIP_TIME: 'total_roundtrip_time',
        UXF_GETMAP_INBOUND_RETURN_TIME: 'uxf_getmap_inbound_return_time',
        UXF_GETMAP_OUTBOUND_CALL_TIME: 'uxf_getmap_outbound_call_time',
        APP_ID: 'app_id',
        BROWSER: 'browser',
        START_TIME: 'start_time'
    },

    _isAlphaNumeric: function(str) {
        return /^[a-zA-Z0-9_]+$/.test(str);
    },
      
    _startsWithALetter: function(str) {
        return /^[A-Za-z]/.test(str);
    },

    _buildLogObject: function(perfObj) {
		var result = "";
        if(perfObj) {
            for (var key in perfObj) {
                if (typeof perfObj[key] !== 'object') {
                    if(!this._isAlphaNumeric(key)){
                        this.logErrorMessage("Key " + key.toString() + " not alphanumeric. Skipping it");
                        continue;
                    }
                    if(!this._startsWithALetter(key)){
                        this.logErrorMessage("Key " + key.toString() + " should not start with a letter. Skipping it");
                        continue;
                    }
                    if(key.toString().length < 2){
                        this.logErrorMessage("Key " + key.toString() + "  length should be atleast 2. Skipping it");
                        continue;
                    }

                    var value = perfObj[key] !== null ? perfObj[key].toString() : '""';
                    if (typeof perfObj[key] === 'string') {
                        //Truncate string is longer than 100
                        value = value.length > 100 ? '"' + value.slice(0, 100) + '"' : '"' + value + '"';
                    }
                    result += key.trim() + "=" + value + " ";
                }
            }
        }
        else {
            this.logErrorMessage("The input object is invalid.");
        }
        return result;
	},

    logMessage: function(appName, message){
        gs.log(appName + ": " + message);

    },

    logErrorMessage: function(appName, message){
        gs.error(appName + ": " + message);

    },

    type: 'CMDBPerfLoggingBase'
};
