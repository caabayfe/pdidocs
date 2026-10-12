(function process(request, response) {
	var meetingId = request.pathParams.meetingId;
	if (!meetingId)
		return new sn_ws_err.BadRequestError("CAB Meeting id not provided");
	
	var meetingGr = new GlideRecord(CAB.MEETING);
	if (!meetingGr.get(meetingId))
		return new sn_ws_err.NotFoundError("CAB Meeting not found");
	
	var attendeeData = new CABMeeting(meetingGr).getAttendeeUserSysIds();
	
	response.setBody(attendeeData);
})(request, response);
