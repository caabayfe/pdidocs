(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

	var className = request.pathParams.className;
	var api = new CMDBIREOutputComparisonApiUtil();
	var results = api.getIRESimulationData(className);
	results.isSkillActive = api.isSkillActive('12345'); // temp skill id
	return results;

})(request, response);
