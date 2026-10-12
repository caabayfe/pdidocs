(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	var gr = new GlideRecord("sys_user");
	var isConcurrentSessionLimitActive = gr.isValidField("limit_concurrent_sessions") && gr.limit_concurrent_sessions == true;

	// implement resource here
	response.setBody({
		isLimitConcurrentSessionsValidField: isConcurrentSessionLimitActive
	});
	response.setStatus(200);

})(request, response);
