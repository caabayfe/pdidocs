var EvtMgmtXmlGenerator = Class.create();
EvtMgmtXmlGenerator.prototype = {
    initialize: function() {
    },

    type: 'EvtMgmtXmlGenerator',
	
	produceXml: function(map, product, markupWriter) {
		var events = new EvtMgmtXmlStatsEvents();
		markupWriter.open("event_processing");
		var element;
		
		// processed
		element = markupWriter.createElement("processed");
		element.setAttribute("count", map[events.EVENT_PROCESSING_PROCESSED_COUNT]["value"]);
		element.setAttribute("mean_process_time", map[events.EVENT_PROCESSING_PROCESSED_MEAN_PROCESS_TIME]["value"]);
		element.setAttribute("max_process_time", map[events.EVENT_PROCESSING_PROCESSED_MAX_PROCESS_TIME]["value"]);
		element.setAttribute("record_time", map[events.EVENT_PROCESSING_PROCESSED_COUNT]["record_time"]);
		
		// ready
		element = markupWriter.createElement("ready");
		element.setAttribute("count", map[events.EVENT_PROCESSING_READY_COUNT]["value"]);
		element.setAttribute("oldest_ready_event", map[events.EVENT_PROCESSING_READY_OLDEST_READY_EVENT]["value"]);
		element.setAttribute("record_time", map[events.EVENT_PROCESSING_READY_COUNT]["record_time"]);
		
		// queued
		//element = markupWriter.createElement("queued");
		//element.setAttribute("count", map[events.EVENT_PROCESSING_QUEUED_COUNT]["value"]);
		//element.setAttribute("record_time", map[events.EVENT_PROCESSING_QUEUED_COUNT]["record_time"]);
		
		// error
		element = markupWriter.createElement("error");
		element.setAttribute("count", map[events.EVENT_PROCESSING_ERROR_COUNT]["value"]);
		element.setAttribute("record_time", map[events.EVENT_PROCESSING_ERROR_COUNT]["record_time"]);
		
		// total
		element = markupWriter.createElement("total_created");
		element.setAttribute("count", map[events.EVENT_PROCESSING_TOTAL_COUNT]["value"]);
		element.setAttribute("record_time", map[events.EVENT_PROCESSING_TOTAL_COUNT]["record_time"]);
		
		markupWriter.close("event_processing");
	}
};
