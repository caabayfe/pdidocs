(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    var eventRuleJson = request.body.data.eventRuleData;
	
	var em = new SNC.EventRuleManager();
	var ruleId = em.saveEventRuleData(eventRuleJson);
	return {
		"event_rule_id": ruleId
	};

})(request, response);
