(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	if (!request.pathParams.muteAction)
		return new sn_ws_err.BadRequestError("mute action - mute/unmute must be specified");
	if (!request.body.data.confId)
		return new sn_ws_err.BadRequestError("conference id must be specified");
	var handler = new CommunicationManagementBridgeSNC().getHandlerInstance(request.queryParams.sysparm_table);
	return handler.doConferenceMutingAction(request.body.data.confId, request.pathParams.muteAction);
})(request, response);
