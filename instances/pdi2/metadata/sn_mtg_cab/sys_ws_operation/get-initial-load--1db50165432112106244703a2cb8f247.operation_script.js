(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	var meetingId = request.pathParams.meetingId;
	
	if (!meetingId) 
		return new sn_ws_err.BadRequestError("CAB Meeting id not provided");
	
	var CABMeeting = new WorkspaceCABMeeting(meetingId);
	if (!CABMeeting.isValidCABMeeting())
		return new sn_ws_err.NotFoundError("Requested CAB Meeting not found");
	
	var initialData = CABMeeting.getInitialData();
	if (!initialData)
		return new sn_ws_err.NotFoundError("Requested CAB Meeting not found");
	
	response.setBody(initialData);
})(request, response);
