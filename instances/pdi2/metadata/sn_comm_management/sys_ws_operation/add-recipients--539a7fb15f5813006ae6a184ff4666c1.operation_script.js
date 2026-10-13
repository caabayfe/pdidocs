(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

	var request_body = request.body.nextEntry();
    var commPlanSysId = request.pathParams.commPlanSysId;
	if (!commPlanSysId)
		return new sn_ws_err.BadRequestError("commPlanSysId not provided");
	if (!request.queryParams.sysparm_table)
		return new sn_ws_err.BadRequestError("sysparm_table not provided");

	var handlerInstance = new CommunicationManagementBridgeSNC().getHandlerInstance(request.queryParams.sysparm_table);
	var success = handlerInstance.addRecipients(commPlanSysId, request_body.recipients);
	if (!success)
		return new sn_ws_err.BadRequestError("access denied");

})(request, response);
