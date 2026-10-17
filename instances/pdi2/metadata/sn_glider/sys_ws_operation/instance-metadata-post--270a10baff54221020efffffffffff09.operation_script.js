(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

	const body = request.body.data;
	gs.getUser().savePreference('nowsdk.instance_metadata', JSON.stringify(body));
	response.setStatus(200);

})(request, response);
