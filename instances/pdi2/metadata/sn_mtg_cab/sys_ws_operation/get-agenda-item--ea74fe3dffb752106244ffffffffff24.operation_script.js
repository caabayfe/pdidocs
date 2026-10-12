(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    var agendaItemId = request.pathParams.agendaItemId;
	
	if (!agendaItemId) 
		return new sn_ws_err.BadRequestError("Agenda Item id not provided");
	
	var cabMeeting = new WorkspaceCABMeeting();
	var agendaItems = cabMeeting.getAgendaItems(agendaItemId.split(','));
	
	if (!agendaItems)
		return new sn_ws_err.NotFoundError("Requested Agenda Item(s) not found");
	
	response.setBody(agendaItems);
})(request, response);
