(function process(request, response) {
    var meetingId = request.pathParams.meetingId;

    if (!meetingId)
        return new sn_ws_err.BadRequestError("CAB Meeting id not provided");

    var freetextQuery = request.pathParams.freetextQuery;
    if (!freetextQuery)
        return new sn_ws_err.BadRequestError("attendee freetextQuery not provided");

    var currentPage = parseInt(request.pathParams.pageNumber);
    if (!currentPage)
        currentPage = 0;
    var CABMeeting = new WorkspaceCABMeeting(meetingId);
    if (!CABMeeting.isValidCABMeeting())
        return new sn_ws_err.NotFoundError("CAB Meeting not found");

    var sort = request.pathParams.sort;
    var filter = request.pathParams.filter;

    response.setBody(CABMeeting.searchAttendees(freetextQuery, currentPage, sort, filter));
})(request, response);
