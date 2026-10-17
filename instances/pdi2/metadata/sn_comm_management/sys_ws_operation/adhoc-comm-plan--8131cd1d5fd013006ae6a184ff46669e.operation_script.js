(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    var request_body = request.body.nextEntry();

	if (!request.queryParams.sysparm_table)
		return new sn_ws_err.BadRequestError("sysparm_table not provided");
	if (!request_body.commPlan)
		return new sn_ws_err.BadRequestError("commPlan not provided");
	if (!request_body.commPlan.source)
		return new sn_ws_err.BadRequestError("commPlan source not provided");
	if (!request_body.commPlan.short_description)
		return new sn_ws_err.BadRequestError("commPlan short_description not provided");
	if (!request_body.commTask)
		return new sn_ws_err.BadRequestError("commTask not provided");
	if (!request_body.commTask.communication_frequency)
		return new sn_ws_err.BadRequestError("commTask.communication_frequency not provided");

	var taskGr = new GlideRecord(request.queryParams.sysparm_table);
	if (taskGr.get(request_body.commPlan.source)) {
		var handlerInstance = new CommunicationManagementBridgeSNC().getHandlerInstance(request.queryParams.sysparm_table);
		var commTaskSysId = handlerInstance.createAdhocCommPlan(request_body.commPlan, request_body.commTask, request_body.channels, taskGr, request_body.recipients, request_body.templateMap);
		return commTaskSysId;
	}
	else
		return new sn_ws_err.BadRequestError("source task not found");

})(request, response);
