(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    var queryParams = request.queryParams;
	
	if (!queryParams.sysparm_old_sys_id || !queryParams.sysparm_new_sys_id) {
		response.setError(new sn_ws_err.BadRequestError('Missing required parameters.'));
		return;
	}
	
    var diffAudit = new DiffAudit();
	var content = diffAudit.getDiff(queryParams);
	
	response.setStatus(200);
	response.setContentType("text/html");
	response.getStreamWriter().writeString(content);

})(request, response);
