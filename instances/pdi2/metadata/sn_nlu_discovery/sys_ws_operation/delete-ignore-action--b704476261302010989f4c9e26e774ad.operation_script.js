(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	var record_id = request.pathParams.record_id;
	var recordType = request.pathParams.record_type;
	var reportDefRec = new GlideRecord('sn_nlu_discovery_report_definition');
	gs.debug('[DISC] Delete ignore intent: Called with record id sys id=' + record_id + " : " + recordType);

	if (recordType != "cluster" && recordType != "intent")    {
		gs.error("record type must be cluster or intent");
		return { success: "failed" };
	}
    var trackedRecord;
	
	var trackUtil = new sn_nlu_discovery.IntentDiscoveryRecordTracking()

	var numOfRecordsDeleted;
	if (recordType === "cluster") {
		//lang intent sys id, cluster sys_id, target_intent
		numOfRecordsDeleted = trackUtil.deleteTrackAction(null, null, record_id, null);
	}  
	if (recordType === "intent") {
		//lang intent sys id, cluster sys_id, target_intent
		numOfRecordsDeleted = trackUtil.deleteTrackAction(null, record_id, null, null);
	}
	
	var status = (numOfRecordsDeleted && numOfRecordsDeleted != null) ? "success" : "failed";
	
	if (status == "failed") {
		gs.error("Something went wrong while create an ignore report intent record");
	}
	
	return { 
		records_deleted: numOfRecordsDeleted,
		success: status,
	};

})(request, response);
