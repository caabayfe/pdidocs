(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

	var requestBody = request.body;
	var requestData = requestBody.data;
	var category = requestData.category;
	var instrumentationPoint = requestData.instrumentationPoint;
	var instrumentationEvent = requestData.instrumentationEvent;
	var gcfSampleMapString = requestData.gcfSampleMap;
	
	if (!category || !instrumentationPoint || !instrumentationEvent || !gcfSampleMapString)
		return new sn_ws_err.BadRequestError('category, instrumentationPoint, InstrumentationEvent and GCFSample are all required.');
 
	try {
		var gcfSampleMap = JSON.parse(gcfSampleMapString);
	} catch (error) {
		return new sn_ws_err.BadRequestError('gcfSampleMap is not a valid json string');
	}
	
	var sm = new GCFSampleMap();
	for (var key in gcfSampleMap)
		sm.put('' + key, '' + gcfSampleMap[key]);
	
	GCFCollector.recordUsageEvent('' + category, '' + instrumentationPoint, '' + instrumentationEvent, sm);

})(request, response);
