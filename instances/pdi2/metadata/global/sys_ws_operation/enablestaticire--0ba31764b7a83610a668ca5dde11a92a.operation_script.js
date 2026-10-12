(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

	const enableStaticIre = "ENABLE_STATIC_IRE";
	var api = new CMDBIREOutputComparisonApiUtil();
	return api.setDynamicIREProperties(enableStaticIre);

})(request, response);
