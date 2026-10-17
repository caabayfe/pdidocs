(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

	var resultObj = {
		timeOutValue: gs.getProperty('cdu.record.watcher.timeout')
	};
	response.setStatus(200);
	response.setContentType('application/json');
	response.setBody(resultObj);

})(request, response);
