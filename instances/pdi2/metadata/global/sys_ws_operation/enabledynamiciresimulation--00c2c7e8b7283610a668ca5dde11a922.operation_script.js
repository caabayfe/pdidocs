(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

	const enableSimulation = "ENABLE_DYNAMIC_IRE_SIMULATION";
	var api = new CMDBIREOutputComparisonApiUtil();
	return api.setDynamicIREProperties(enableSimulation);

})(request, response);
