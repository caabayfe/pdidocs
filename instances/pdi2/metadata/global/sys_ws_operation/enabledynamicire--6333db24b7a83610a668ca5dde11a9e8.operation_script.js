(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

	const enableDynamicIre = "ENABLE_DYNAMIC_IRE";
	var api = new CMDBIREOutputComparisonApiUtil();
	return api.setDynamicIREProperties(enableDynamicIre);

})(request, response);
