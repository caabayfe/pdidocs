(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	var params = request.body.nextEntry();
    
	var agendaItemIds = params.agendaItemIds;
	
	if (!agendaItemIds || agendaItemIds.length === 0) 
		return new sn_ws_err.BadRequestError("Agenda Item id not provided");
	
	var cabMeeting = new CABMeeting();
	var agendaItems = cabMeeting.getAgendaItems(agendaItemIds);
	
	if (!agendaItems)
		return new sn_ws_err.NotFoundError("Requested Agenda Item(s) not found");
	
	response.setBody(agendaItems);
})(request, response);
