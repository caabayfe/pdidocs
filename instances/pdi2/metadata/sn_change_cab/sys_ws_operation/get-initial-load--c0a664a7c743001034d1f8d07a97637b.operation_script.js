(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	var meetingId = request.pathParams.meetingId;
	
	if (!meetingId) 
		return new sn_ws_err.BadRequestError("CAB Meeting id not provided");
	
	var cabMeetingGr = new GlideRecord(CAB.MEETING);
	if (!cabMeetingGr.get(meetingId))
		return new sn_ws_err.NotFoundError("Requested CAB Meeting not found");
	
	var runtimeState = CABRuntimeState.get(meetingId);
	if (!runtimeState)
		return new sn_ws_err.NotFoundError("Requested CAB Meeting not found");
	
	var cabMeeting = new CABMeeting(cabMeetingGr);
	var agendaState = cabMeeting.getInitialAgendaState();
	var attendeeData = cabMeeting.getAttendeeUserSysIds();
	
	var rs = runtimeState.toJS();
	rs.cab_meeting.record = cabMeeting.toJS();
	rs.request_time_ms = (new GlideDateTime()).getNumericValue();
	
	response.setBody({
		"runtime_state": rs,
		"agenda": agendaState,
		"attendee": attendeeData
	});
})(request, response);
