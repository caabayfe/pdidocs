(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    // Validation of call
	var taskSysId = request.pathParams.taskSysId;
	if (!taskSysId)
		return new sn_ws_err.BadRequestError("Task id not provided");

	var taskGr = new GlideRecord('task');
	if (!taskGr.get(taskSysId))
		return new sn_ws_err.NotFoundError("Requested Task not found");

	var communicationManagementRestHandlerSNC = new CommunicationManagementRestHandlerSNC();
	return communicationManagementRestHandlerSNC.getGroups(taskSysId, request.queryParams.recordClass);

})(request, response);
