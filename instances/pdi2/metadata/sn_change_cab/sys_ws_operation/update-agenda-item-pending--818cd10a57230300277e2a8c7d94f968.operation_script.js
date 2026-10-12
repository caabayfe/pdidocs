(function process(request, response) {
	var agendaItemId = request.pathParams.agendaItemId;
	if (!agendaItemId)
		return new sn_ws_err.BadRequestError("Agenda Item id not provided");

	var agendaItemGr = new GlideRecord(CAB.AGENDA_ITEM);
	if (!agendaItemGr.get(agendaItemId))
		return new sn_ws_err.NotFoundError("Requested Agenda Item not found");

	var decision = agendaItemGr.getValue('state');
	if (decision !== 'no_decision')
		return new sn_ws_err.BadRequestError("Cannot modify Agenda Item state to 'pending' from '" + decision + "'");

	var agendaItem = new CABAgendaItem(agendaItemGr);
	var meetingSysId = agendaItem.getValue(CAB.MEETING);
	var meetingGr = new GlideRecord(CAB.MEETING);
	if (!meetingGr.get(meetingSysId))
		return new sn_ws_err.NotFoundError("CAB Meeting not found");

	var order = new CABMeeting(meetingGr).getLastPendingAgendaItemOrder() + 100;
	agendaItem.setValue('state', CAB.MEETING_STATE.PENDING);
	agendaItem.setValue('order', order);
	agendaItem.update();

	response.setContentType('application/json');
	response.setBody({pendingState: 'true'});
	response.setStatus(202);

	return response;
})(request, response);
