(function process(request, response) {
	var meetingId = request.pathParams.meetingId;
	if (!meetingId) 
		return new sn_ws_err.BadRequestError("CAB Meeting id not provided");
	
	var nextItemId = request.pathParams.nextItemId;
	if (!nextItemId)
		return new sn_ws_err.BadRequestError("Next Agenda Item not provided");
	
	var runtimeState = CABRuntimeState.get(meetingId);
	runtimeState.nextAgendaItem(nextItemId, true);
	response.setBody(runtimeState.toJS());
})(request, response);
