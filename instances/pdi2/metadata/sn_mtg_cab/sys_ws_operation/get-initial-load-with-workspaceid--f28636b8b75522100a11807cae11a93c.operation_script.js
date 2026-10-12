(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	var meetingId = request.pathParams.meetingId;
	var workspaceId = request.pathParams.workspaceId;
	
	if (!meetingId) 
		return new sn_ws_err.BadRequestError("CAB Meeting id not provided");
	if (!workspaceId) 
		return new sn_ws_err.BadRequestError("CAB Workspace id not provided");
	
	var CABMeeting = new WorkspaceCABMeeting(meetingId);
	if (!CABMeeting.isValidCABMeeting())
		return new sn_ws_err.NotFoundError("Requested CAB Meeting not found");
	
	CABMeeting.setWorkspaceId(workspaceId);
	var initialData = CABMeeting.getInitialData();
	if (!initialData)
		return new sn_ws_err.NotFoundError("Requested CAB Meeting not found");
	
	response.setBody(initialData);
})(request, response);
