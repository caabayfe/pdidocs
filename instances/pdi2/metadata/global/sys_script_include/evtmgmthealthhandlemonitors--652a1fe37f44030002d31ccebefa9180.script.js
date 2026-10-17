var EvtMgmtHealthHandleMonitors = Class.create();
EvtMgmtHealthHandleMonitors.prototype = {
    initialize: function() {},

	handleMonitors: function(functionName) {
        gs.include("EvtMgmtHealthMonitorCommon");

        var evtMgmtHealthMonitorCommon = new EvtMgmtHealthMonitorCommon();

        if (!evtMgmtHealthMonitorCommon.allowHealthToRun()) {
            return false;
        }

        var gr = new GlideRecord("em_monitor_scripts");
        gr.addQuery("active", true);
        gr.query();

        var param = new Packages.java.util.HashMap();
        param.put("functionName", functionName);
		var recordsToWriteFor = gs.getProperty("sa_analytics.monitors_to_add_to_performance_statistics", "");
		if(global.JSUtil.notNil(recordsToWriteFor)){
			recordsToWriteFor = recordsToWriteFor.split(",");
		}
        while (gr.next()) {
            var scriptSysId = gr.getValue("sys_id");
            var script = gr.getValue("script");
            var monitorGr = evtMgmtHealthMonitorCommon.getMonitorConfigRecord(scriptSysId);
            while (monitorGr != null && monitorGr.next()) {
                var shouldRun = evtMgmtHealthMonitorCommon.shouldRun(monitorGr.getUniqueValue(), monitorGr);
                if (shouldRun) {
                    param.put("scriptId", gr.getUniqueValue());
                    
                    // Record execution start time
                    var startTime = new GlideDateTime();
                    
                    GlideEvaluator.evaluateStringWithGlobals(script, param);
                    
                    // Record execution end time
                    var endTime = new GlideDateTime();
                    
                    // Calculate duration in milliseconds
                    var duration = GlideDateTime.subtract(startTime, endTime).getNumericValue();
                    
					
					if(gs.getProperty("sa_analytics.write_execution_to_performance_statistics", "false") === "true"){
						if(global.JSUtil.notNil(recordsToWriteFor) && recordsToWriteFor.includes(monitorGr.getValue("name"))) {
							gs.info("writing to performance statistics ... " + monitorGr.getValue("name"));
							// Get monitor frequency
                            var frequency = monitorGr.getValue('frequency');
                            

                            // Create metrics JSON object
                            var metricsData = {
                                start_time: startTime.getDisplayValue(),
                                end_time: endTime.getDisplayValue(),
                                duration_ms: duration,
                                frequency: frequency,
                                monitor_name: monitorGr.getValue("name"),
                                monitor_id: monitorGr.getUniqueValue()
                            };
                            
                            this._recordMonitorStatistics(gr.getValue("name"), metricsData);
						}
					}
                }
            }
        }
    },
    

    _recordMonitorStatistics: function(monitorName, metricsData) {
        var performanceStatisticsRecord = new GlideRecord("sa_performance_statistics");
        performanceStatisticsRecord.initialize();
        performanceStatisticsRecord.setValue("source", "Self health monitor");
        performanceStatisticsRecord.setValue("type", "selfMonitorExecution");
        
        // Store metrics in extra_data column
        performanceStatisticsRecord.setValue("extra_data", JSON.stringify(metricsData));
		performanceStatisticsRecord.setValue("duration", metricsData.duration_ms);
        
        performanceStatisticsRecord.insert();
        
    },

    type: 'EvtMgmtHealthHandleMonitors'
};
