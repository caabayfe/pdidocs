(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    var meetingId = request.pathParams.meeting_sys_id;

    if (!meetingId)
        return new sn_ws_err.BadRequestError("CAB Meeting id not provided");

    var CABMeeting = new WorkspaceCABMeeting(meetingId);
    if (!CABMeeting.isValidCABMeeting())
        return new sn_ws_err.NotFoundError("Requested CAB Meeting not found");

    var shareMeetingNotes = CABMeeting.shareMeetingNotes();
    if (!shareMeetingNotes)
        return new sn_ws_err.NotFoundError("Failed to share CAB Meeting notes with Attendees");

    response.setBody(shareMeetingNotes);
})(request, response);
