(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    // implement resource here
	var action = request.pathParams.action;
	if(!action)
		return new sn_ws_err.BadRequestError("action must be specified");

	var actionInfo = request.body.nextEntry();
	var handler = new CommunicationManagementBridgeSNC().getHandlerInstance(request.queryParams.sysparm_table);
	return handler.doNotifyParticipantAction(action, actionInfo);
})(request, response);
