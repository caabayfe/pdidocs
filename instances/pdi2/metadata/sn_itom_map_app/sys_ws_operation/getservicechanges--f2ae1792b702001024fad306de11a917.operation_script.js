/**
 * Brings topology changes for the given time interval, from the timeline data.
 * Aggregation of bubbles is disabled.
 * Severity changes are excluded.
 * Service creation bubble is excluded.
 * Baselines are excluded.
 */
(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	var queryParams = request.queryParams;
	var serviceId = queryParams.serviceId || '';
	var startTime = queryParams.startTime || '';
	var endTime = queryParams.endTime || '';
	
	
	var mgr = new sn_itom_map_app.ScopedHistoryManager();
	
    var json = String(mgr.getServiceTimeline(
		serviceId, 
		startTime, 
		endTime, 
		0, //interval
		false, //addServiceCreatedBubble
		false, //aggregateChanges, 
		false, //includeSeverityChanges, 
		false //includeBaselines
	));
	
	response.setStatus(200);
	response.setContentType('application/json');
	var writer = response.getStreamWriter();
	writer.writeString(json);

})(request, response);
