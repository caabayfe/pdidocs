var EvtMgmtXmlStatsEvents = Class.create();
EvtMgmtXmlStatsEvents.prototype = {
    EVENT_PROCESSING_CATEGORY : "event_processing",
	EVENT_PROCESSING_PROCESSED_COUNT : "event_processing/processed@count",
	EVENT_PROCESSING_PROCESSED_MEAN_PROCESS_TIME : "event_processing/processed@mean_process_time",
	EVENT_PROCESSING_PROCESSED_MAX_PROCESS_TIME : "event_processing/processed@max_process_time",
	EVENT_PROCESSING_READY_COUNT : "event_processing/ready@count",
	EVENT_PROCESSING_READY_OLDEST_READY_EVENT : "event_processing/ready@oldest_ready_event",
	EVENT_PROCESSING_QUEUED_COUNT : "event_processing/queued@count",
	EVENT_PROCESSING_ERROR_COUNT : "event_processing/error@count",
	EVENT_PROCESSING_TOTAL_COUNT : "event_processing/total_created@count",
	EVENT_PROCESSING_JOBS_EXPECTED_COUNT : "event_processing/jobs@expected_count",
	EVENT_PROCESSING_JOBS_ACTUAL_COUNT : "event_processing/jobs@actual_count",
	EVENT_PROCESSING_JOBS_JOB_SYSID : "event_processing/jobs/job@sysId",
	EVENT_PROCESSING_JOBS_JOB_CLASS : "event_processing/jobs/job@class",
	EVENT_PROCESSING_JOBS_JOB_STATE : "event_processing/jobs/job@state",
	EM_PRODUCT: "EM",
    initialize: function() {
    },

    type: 'EvtMgmtXmlStatsEvents',
	doRun: function() {
		var healthMonitorCommon = new EvtMgmtHealthMonitorCommon();
        var queuedCount = 0;
        var errorCount = 0;
		var minReadyAge = 0;
        var readyCount = 0;
        var processedCount = 0;
		var maxProcessed = 0;
		var meanProcessed = 0;
		var totalCount = 0;

		var recordTime = new GlideDateTime();
		
		// calculate oldest ready event age
		var oldestProcessingPeriod = gs.getProperty('evt_mgmt.event_processing_stats_oldest_ready_event_period', 600);
		var startOldestTime = new GlideDateTime(recordTime);
       	startOldestTime.subtract(parseInt(oldestProcessingPeriod, 10)*1000);
		var gr = new GlideRecord("em_event");
		gr.addQuery("state", "Ready");
		gr.addQuery("sys_created_on",">=",startOldestTime);
		gr.orderBy("sys_created_on");
		gr.setLimit(1);
		gr.query();
		if (gr.next()) {
			minReadyAge = gs.dateDiff(gr.sys_created_on, recordTime, true);
		}		
		
		// calculate total count
		var startTime = new GlideDateTime(recordTime);
		var statsProcessingPeriod = gs.getProperty('evt_mgmt.event_processing_stats_period', 60);
   		startTime.subtract(parseInt(statsProcessingPeriod, 10)*1000);
		var totalGr = new GlideAggregate("em_event");
		totalGr.addQuery("sys_created_on",">=",startTime);	
		totalGr.addQuery("sys_created_on","<=",recordTime);		
       	totalGr.addAggregate('COUNT',null);	
       	totalGr.query();
		if (totalGr.next()) {
			totalCount = totalGr.getAggregate('COUNT',null);
		}
				
		// calculate counts for each state
		var eventGr = new GlideAggregate("em_event");
		if (eventGr.isValid()){
			eventGr.addQuery("sys_created_on",">=",startOldestTime);			
			eventGr.addQuery("sys_updated_on","<=",recordTime);			
       		eventGr.addQuery("sys_updated_on",">=",startTime);
       		eventGr.groupBy("state");
       		eventGr.addAggregate('COUNT','sys_id');
			eventGr.addAggregate('MAX','processing_duration');
       	    eventGr.addAggregate('AVG','processing_duration');
       		eventGr.query();

			while(eventGr.next() ){
           		var state=eventGr.getValue("state");
            	var stateCount = eventGr.getAggregate('COUNT', 'sys_id');
            	
				switch(state) {
                	case "Error":
						errorCount = stateCount;
						break;
					case "Ready":
                  		readyCount = stateCount;
				    	break;
					case "Processed":	
						processedCount = stateCount;
						maxProcessed = eventGr.getAggregate('MAX','processing_duration')/1000;
						maxProcessed = parseFloat(maxProcessed).toFixed(3);
                        meanProcessed = eventGr.getAggregate('AVG','processing_duration')/1000;
						meanProcessed = parseFloat(meanProcessed).toFixed(3);
						break;
            		default:
						// we don't check Queued events since it will result in an additional query (by sys_created_on)
						// when an event changes its state from Ready to Queued, it's sys_updated does not change (remains equal to sys_created_on)
						//if (state.substring(1, 6)=="Queued") {
						//	queuedCount += stateCount;
						//}
            	}
        	}
		}
        healthMonitorCommon.writeToXMLStatsDataTable(this.EVENT_PROCESSING_READY_COUNT, 
			this.EVENT_PROCESSING_CATEGORY, 
            readyCount, recordTime, this.EM_PRODUCT);
        healthMonitorCommon.writeToXMLStatsDataTable(this.EVENT_PROCESSING_READY_OLDEST_READY_EVENT, 
           	this.EVENT_PROCESSING_CATEGORY, 
           	minReadyAge, recordTime, this.EM_PRODUCT);
        healthMonitorCommon.writeToXMLStatsDataTable(this.EVENT_PROCESSING_ERROR_COUNT, 
        	this.EVENT_PROCESSING_CATEGORY, 
          	errorCount,	recordTime, this.EM_PRODUCT);
        //healthMonitorCommon.writeToXMLStatsDataTable(this.EVENT_PROCESSING_QUEUED_COUNT, 
		//	this.EVENT_PROCESSING_CATEGORY, 
        //    queuedCount, recordTime);
        healthMonitorCommon.writeToXMLStatsDataTable(this.EVENT_PROCESSING_PROCESSED_COUNT, 
           	this.EVENT_PROCESSING_CATEGORY, 
           	processedCount, recordTime, this.EM_PRODUCT);
        healthMonitorCommon.writeToXMLStatsDataTable(this.EVENT_PROCESSING_PROCESSED_MAX_PROCESS_TIME, 
           	this.EVENT_PROCESSING_CATEGORY, 
           	maxProcessed, recordTime, this.EM_PRODUCT);
		healthMonitorCommon.writeToXMLStatsDataTable(this.EVENT_PROCESSING_PROCESSED_MEAN_PROCESS_TIME, 
			this.EVENT_PROCESSING_CATEGORY, 
            meanProcessed, recordTime, this.EM_PRODUCT);
		healthMonitorCommon.writeToXMLStatsDataTable(this.EVENT_PROCESSING_TOTAL_COUNT, 
			this.EVENT_PROCESSING_CATEGORY, 
            totalCount, recordTime, this.EM_PRODUCT);
    },
};
