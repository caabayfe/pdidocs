(function process(request, response) {
    var meetingId = request.pathParams.meeting_sys_id;
    if (!meetingId)
        return new sn_ws_err.BadRequestError("CAB Meeting id not provided");

    var nextItemId = request.pathParams.next_item_sys_id;

    var cabMeeting = new WorkspaceCABMeeting(meetingId);

    cabMeeting.deferAgendaItem(nextItemId, true);

    response.setBody();
})(request, response);
