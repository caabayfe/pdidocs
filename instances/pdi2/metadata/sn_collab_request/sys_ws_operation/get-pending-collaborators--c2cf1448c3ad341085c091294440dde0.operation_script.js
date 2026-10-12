(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	var errors = CollabTaskConstants.errors;
    var appId = request.pathParams.application_sys_id;
	
	if (!appId) {
      throw new sn_ws_err.ServiceError()
			.setStatus(statusCodes.BAD_REQUEST)
			.setMessage(gs.getMessage("Missing App Id"));
    }
	
	var result = CollabTaskService.getPendingCollaborators(appId);
	response.setBody(result.body);
	response.setStatus(result.status);

})(request, response);
