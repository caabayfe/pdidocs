var ATFGlobalDebugAgentUtil = Class.create();
ATFGlobalDebugAgentUtil.prototype = {
    initialize: function() {},

    startTracing: function(contextName) {
        var traceGR = new GlideRecord("sys_trace_config");
        traceGR.destination = "metadata";
        traceGR.span_selection = JSON.stringify({
            "conditions": [
                [{
                    "value": contextName,
                    "key": "custom.test_result_id",
                    "operator": "="
                }]
            ]
        });
        traceGR.trace_selection = JSON.stringify({
            "conditions": [
                [{
                    "value": contextName,
                    "key": "test_result_id",
                    "operator": "="
                }]
            ]
        });

        var endTime = new GlideDateTime();
        endTime.addSeconds(60 * 20); // 20 minutes
        traceGR.end_time = endTime;

        return traceGR.insert();
    },

    stopTracing: function(tracingSysId) {
        traceConfigGr = new GlideRecord("sys_trace_config");
        if (traceConfigGr.get(tracingSysId))
            traceConfigGr.deleteRecord();
    },

    type: 'ATFGlobalDebugAgentUtil'
};
