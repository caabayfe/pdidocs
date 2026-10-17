(function process(request, response) {
	var meetingId = request.pathParams.meetingId;
	var runtimeState = CABRuntimeState.get(meetingId);
	if (!runtimeState)
		return new sn_ws_err.BadRequestError("Cannot find a CAB Meeting record with the given CAB Meeting id");

	var nextItemId = request.pathParams.nextItemId;
	if (!nextItemId)
		return new sn_ws_err.BadRequestError("Next Agenda Item id not provided");

	runtimeState.demoteCurrentAgendaItem(nextItemId);
	response.setBody(runtimeState.toJS());

})(request, response);
