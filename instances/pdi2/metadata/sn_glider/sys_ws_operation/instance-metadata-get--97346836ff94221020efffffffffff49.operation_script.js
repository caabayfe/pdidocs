(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

	const instanceMeta = JSON.parse(gs.getUser().getPreference('nowsdk.instance_metadata') || '{}');
	response.setBody(instanceMeta);
	response.setContentType('application/json');
	response.setStatus(200);

})(request, response);
