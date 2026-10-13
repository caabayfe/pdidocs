(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    var record_id = request.pathParams.record_id;
	var recordType = request.pathParams.record_type;
	var reportDefRec = new GlideRecord('sn_nlu_discovery_report_definition');

	gs.debug('[DISC] ignore intent: Called with record id sys id=' + record_id + " : " + recordType);

	if (recordType != "cluster" && recordType != "intent")    {
		gs.error("record type must be cluster or intent");
		return { success: "failed" };
	}

    var trackedRecord;
	var trackUtil = new sn_nlu_discovery.IntentDiscoveryRecordTracking();

	if (recordType === "cluster") {
		trackedRecord = trackUtil.trackClusterAction(record_id, null, null);
	}

	if (recordType === "intent") {
		trackedRecord = trackUtil.trackIntentAction(record_id, null, null);
	}

	var status = (trackedRecord && trackedRecord != null) ? "success" : "failed";

	if (status == "failed") {
		gs.error("Something went wrong while create an ignore report intent record");
	}

	return {
		tracked_id: trackedRecord,
		success: status,
	};
})(request, response);
