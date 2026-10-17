var KPIUtil = Class.create();
KPIUtil.prototype = {
    initialize: function() {
    },
	
	updateKPIResults:function(connectorId, lastStatus, last_kpi_signature, lastError){
		var ciGr =  new GlideRecord('em_connector_instance');
		if (!ciGr.get(connectorId)) {
			gs.log('Could not find connector instance ' + connectorId);
			return;
		}
		if (lastStatus == "SUCCESS"){
			lastStatus = "Success";
			lastError = "";
		}
		else{
			lastStatus = "Error";
			lastError = "METRICS\n-------------------------------------------------------------\n" + lastError;
		}
		
		var lastErrorUtil = new LastErrorUtils();
		lastErrorUtil.updateErrorMsg(ciGr, "kpi", lastError);
		ciGr.setValue('last_kpi_status',lastStatus);
		ciGr.setValue('kpi_running',false);
		
		var now = new GlideDateTime();
		ciGr.setValue('kpi_last_run_time', now);
		
		ciGr.setValue('last_kpi_signature', last_kpi_signature);
		ciGr.update();
		gs.log("Done updating connector instance: " + ciGr.getValue("name") + " with KPI results");
		
	},
	
	updatePerformance:function(source, numberOfProcessedMetrics, duration) {
		
		gs.debug("Updating metric performance numbers: " + source + " " + numberOfProcessedMetrics + " " + duration);
		
		if(GlideStringUtil.nil(numberOfProcessedMetrics))
			return;
		
		if (typeof numberOfProcessedMetrics === 'undefined' || typeof duration === 'undefined')
			return;
		
		var count = parseInt(numberOfProcessedMetrics) || 0;
		if(count > 0) {
			var performanceStatisticsGr =  new GlideRecord('sa_performance_statistics');
			performanceStatisticsGr.setValue("type", "metricCollector");
			performanceStatisticsGr.setValue("count", count);
			if(GlideStringUtil.notNil(source))
				performanceStatisticsGr.setValue("source", source);
			var durationNumber = parseInt(duration) || 0;
			performanceStatisticsGr.setValue("duration", durationNumber);
			performanceStatisticsGr.insert();
		}
    },

    type: 'KPIUtil'
};

    

KPIUtil.get = function(){
	return new KPIUtil();
};
