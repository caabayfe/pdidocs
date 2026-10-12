function script({ api, event, helpers, imports }) {
    //capturePerfTimestamps script in Map Search Filter UI Controller; fired after the mapViewReady event is fired from the nodemap component
    var timestamp = Date.now();
    const { capturePerfMetrics, PERF_METRICS } = imports['sn_cmdb_ws.unifiedMapUtilsMapSearchFilter']();
    const { logToConsole } = imports["sn_cmdb_ws.unifiedMapUtils"]();

    logToConsole('nodemap component fired event SN_NODE_MAP#MAP_VIEW_READY');

    var captures = [
        {
            metricToCapture: PERF_METRICS.NODEMAP_COMPONENT_RENDERING_TIME,
            isStartTime: false
        },{
            metricToCapture: PERF_METRICS.TOTAL_ROUNDTRIP_TIME,
            isStartTime: false
        }
    ];

    capturePerfMetrics({ 
        perfMetrics: api.state.perfMetrics,
        captures: captures,
        timestamp: timestamp,
        persist: true,
        api: api,
        helpers: helpers
    });
}
