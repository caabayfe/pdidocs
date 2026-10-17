(function process(request, response) {
	var meetingId = request.pathParams.meetingId;
	if (!meetingId) 
		return new sn_ws_err.BadRequestError("CAB Meeting id not provided");
	
	var runtimeState = CABRuntimeState.get(request.pathParams.meetingId);
	if (!runtimeState)
		return new sn_ws_err.NotFoundError("Requested CAB Meeting not found");
	
	var cabMeetingGr = runtimeState.getGlideRecord().cab_meeting.getRefRecord();
	var cabMeeting = new CABMeeting(cabMeetingGr);
	
	var rs = runtimeState.toJS();
	rs.cab_meeting.record = cabMeeting.toJS();
	
	// Add request time for time adjustment
	rs.request_time_ms = (new GlideDateTime()).getNumericValue();
	
	response.setBody(rs);
})(request, response);
