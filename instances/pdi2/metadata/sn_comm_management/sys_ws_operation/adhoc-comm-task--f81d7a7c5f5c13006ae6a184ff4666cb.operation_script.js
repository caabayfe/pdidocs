(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

   var request_body = request.body.nextEntry();

	if (!request.queryParams.sysparm_table)
		return new sn_ws_err.BadRequestError("sysparm_table not provided");
	if (!request_body.commTask)
		return new sn_ws_err.BadRequestError("commTask not provided");
	if (!request_body.commTask.comm_plan)
		return new sn_ws_err.BadRequestError("commTask.comm_plan not provided");
	if (!request_body.commTask.communication_frequency)
		return new sn_ws_err.BadRequestError("commTask.communication_frequency not provided");

	var handlerInstance = new CommunicationManagementBridgeSNC().getHandlerInstance(request.queryParams.sysparm_table);
	var commTaskSysId = handlerInstance.createAdhocCommTask(request_body.commTask, request_body.channels, request_body.recipients, request_body.templateMap);
	return commTaskSysId;

})(request, response);
