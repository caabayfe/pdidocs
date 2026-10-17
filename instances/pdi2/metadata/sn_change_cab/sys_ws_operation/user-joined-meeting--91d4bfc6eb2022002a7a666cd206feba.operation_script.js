(function process(request, response) {
	var meetingId = request.pathParams.meetingId;
	var userId = request.pathParams.userId;
	
	if (!meetingId)
		return new sn_ws_err.BadRequestError("Meeting id not provided");

	if (!userId)
		return new sn_ws_err.BadRequestError("Attendee id not provided");
	
	var cabMeetingGr = new GlideRecord(CAB.MEETING);
	if (!cabMeetingGr.get(meetingId))
		return new sn_ws_err.NotFoundError("Meeting record not found");
	
	var userGr = new GlideRecord("sys_user");
	if (!userGr.get(userId))
		return new sn_ws_err.NotFoundError("User record not found");
	
	// If our meeting isn't in progress then we don't need to update the attendees
	if (cabMeetingGr.getValue("state") != "in_progress")
		return;
	
	var cabAttendeeGr = new GlideRecord(CAB.ATTENDEE);
	cabAttendeeGr.addQuery("cab_meeting", meetingId);
	cabAttendeeGr.addQuery("attendee", userId);
	cabAttendeeGr.query();
	
	var cabAttendee;
	if (!cabAttendeeGr.next()) {
		cabAttendee = CABAttendee.newAttendee(userGr);
		cabAttendee.setValue("cab_meeting", meetingId);
		cabAttendee.setValue("attendance", "attending");
	} else
		cabAttendee = new CABAttendee(cabAttendeeGr);
		
	cabAttendee.joinedMeeting();
	if (!cabAttendee.update())
		return new sn_ws_err.ServiceError().setMessage("Failed to update attendee record");

	var retVal = cabAttendee.toJS();

	response.setBody(retVal);	
})(request, response);
