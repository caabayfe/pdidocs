(function process(request, response) {
    var meetingId = request.pathParams.meetingId;
    if (!meetingId)
        return new sn_ws_err.BadRequestError("CAB Meeting id not provided");
    var agendaItemId = request.pathParams.agendaItemId;
    if (!agendaItemId)
        return new sn_ws_err.BadRequestError("Agenda Item id not provided");

    var cabMeeting = new WorkspaceCABMeeting(meetingId);

    var agendaState = cabMeeting.restoreAgendaItem(agendaItemId);

    if (!agendaState)
        return new sn_ws_err.NotFoundError("Agenda Item is not restored");

    response.setContentType('application/json');
    response.setBody({
        state: agendaState
    });
    response.setStatus(202);

    return response;
})(request, response);
