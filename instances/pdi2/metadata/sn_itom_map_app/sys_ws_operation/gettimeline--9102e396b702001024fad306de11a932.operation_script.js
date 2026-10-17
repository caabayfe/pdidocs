/**
 * Brings the timeline data for the given time interval.
 * Aggregation of bubbles is disabled.
 * Severity changes are parametrized (true | false)
 * Service creation bubble is included.
 * Baselines are excluded.
 */
(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	var queryParams = request.queryParams;
	var serviceId = String(queryParams.serviceId || '');
	var startTime = String(queryParams.startTime || '');
	var endTime = String(queryParams.endTime || '');
	var showSeverity = String(queryParams.showSeverity) === 'true';
	
	
	var mgr = new sn_itom_map_app.ScopedHistoryManager();
	
    var jsonArr = String(mgr.getServiceTimeline(
		serviceId, 
		startTime, 
		endTime, 
		0, //interval
		true, //addServiceCreatedBubble
		false, //aggregateChanges, 
		showSeverity, //includeSeverityChanges, 
		false //includeBaselines
	));
	
	var requestedRange = {
		start: startTime,
		end: endTime
	};
	
	var json = '{"requestedRange": ' + JSON.stringify(requestedRange) + ', "historyData": ' + jsonArr + '}';
	
	response.setStatus(200);
	response.setContentType('application/json');
	var writer = response.getStreamWriter();
	writer.writeString(json);

})(request, response);
