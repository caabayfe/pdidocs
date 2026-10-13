(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    var inputType = request.queryParams.inputType;
	var sysId = request.queryParams.sysId;
	
	var em = new SNC.EventRuleManager();
	var json = em.getEventRuleData(inputType, sysId);
	return {
		"event_data": json
	};

})(request, response);
