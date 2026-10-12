(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

	const disableSimulation = "DISABLE_DYNAMIC_IRE_SIMULATION";
	var api = new CMDBIREOutputComparisonApiUtil();
	return api.setDynamicIREProperties(disableSimulation);

})(request, response);
