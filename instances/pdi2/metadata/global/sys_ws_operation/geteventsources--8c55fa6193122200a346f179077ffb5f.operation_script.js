(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

	var em = new SNC.EventRuleManager();
	var sourcesList = em.getAllEventSources();
	return {
		"sources": sourcesList
	};

})(request, response);
