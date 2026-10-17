(function process(request, response) {
	var meetingId = request.pathParams.meetingId;
	
	if (!meetingId) 
		return new sn_ws_err.BadRequestError("CAB Meeting id not provided");
	
	var cabMeetingGr = new GlideRecord(CAB.MEETING);
	if (!cabMeetingGr.get(meetingId))
		return new sn_ws_err.NotFoundError("Requested CAB Meeting not found");
	
	var cabMeeting = new CABMeeting(cabMeetingGr);
	var agendaState = cabMeeting.getInitialAgendaState();
	
	response.setBody(agendaState);
		
})(request, response);
