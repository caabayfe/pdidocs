(function process(request, response) {
	var meetingId = request.pathParams.meetingId;
	if (!meetingId) 
		return new sn_ws_err.BadRequestError("CAB Meeting id not provided");
	
	var runtimeState = CABRuntimeState.get(meetingId);
	runtimeState.startMeeting();
	response.setBody(runtimeState.toJS());	
})(request, response);
