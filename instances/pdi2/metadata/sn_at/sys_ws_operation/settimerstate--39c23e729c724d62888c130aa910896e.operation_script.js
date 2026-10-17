(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	const {data} = request.body;
	const atUtils = new sn_at.ActivityTimerUtils();
	const result = atUtils.setTimerState(data.requestArray);
	response.setStatus(200);
	response.setBody(result);

})(request, response);
