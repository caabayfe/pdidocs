function script({ api, event, helpers, imports }) {
    //capturePerfTimestamps script in Get Map Data Controller; fired after a map search is initiated when rootNode or levels changes
    var timestamp = Date.now();

    //metrics pipeline starting; capture timestamps for
    // 1) start time for total_roundtrip start and 
    // 2) start time for uxf getMap outbound call time
    const { capturePerfMetrics, PERF_METRICS } = imports['sn_cmdb_ws.unifiedMapUtilsMapSearchFilter']();

    // start with a new set of metrics clear the old values since this is a new search
    var perfMetrics = {
        app_id: null,
        browser: null,
        ci_name: null,
        ci_sysid: null,
        cmdb_map_only: null,
        base_state_type: null,
        levels: null,
        number_of_edges: null,
        number_of_nodes: null,
        start_time: null,
        uxf_getmap_outbound_call_time: {},
        cmdb_getmap_api_time: {},
        sm_getmap_api_time: {},
        total_backend_time: {},
        uxf_getmap_inbound_return_time: {},
        cmdb_frontend_time: {},
        nodemap_component_rendering_time: {},
        total_roundtrip_time: {}
    };

    var captures = [
        {
            metricToCapture: PERF_METRICS.TOTAL_ROUNDTRIP_TIME,
            isStartTime: true
        },{
            metricToCapture: PERF_METRICS.UXF_GETMAP_OUTBOUND_CALL_TIME,
            isStartTime: true
        }
    ];

    capturePerfMetrics({ 
        perfMetrics: perfMetrics,
        captures: captures,
        timestamp: timestamp,
        persist: false,
        api: api
    });
}
