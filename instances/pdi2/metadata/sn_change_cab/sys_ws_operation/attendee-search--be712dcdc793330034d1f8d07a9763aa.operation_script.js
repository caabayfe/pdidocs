(function process(request, response) {
	var meetingId = request.pathParams.meetingId;
	var freetextQuery = request.pathParams.freetextQuery;
	if (!meetingId || !freetextQuery)
		return new sn_ws_err.BadRequestError("CAB Meeting id or freetext query not provided");
	
	var meetingGr = new GlideRecord(CAB.MEETING);
	if (!meetingGr.get(meetingId))
		return new sn_ws_err.NotFoundError("CAB Meeting not found");
	
	var attendeeResult = new CABMeeting(meetingGr).searchAttendees(freetextQuery);
	
	response.setBody(attendeeResult);
})(request, response);
