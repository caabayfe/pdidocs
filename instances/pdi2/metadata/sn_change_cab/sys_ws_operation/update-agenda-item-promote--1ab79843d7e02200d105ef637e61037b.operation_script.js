(function process(request, response) {
	var agendaItemId = request.pathParams.agendaItemId;
	var agendaItemGr = new GlideRecord('cab_agenda_item');

	if (!agendaItemId)
		return new sn_ws_err.BadRequestError("Agenda Item id not provided");

	if (!agendaItemGr.get(agendaItemId))
		return new sn_ws_err.NotFoundError("Requested Agenda Item not found");

	var agendaItemState = agendaItemGr.getValue("state");
	if (agendaItemState !== "pending")
		return new sn_ws_err.BadRequestError("Cannot promote the Agenda Item. State is " + agendaItemState);

	var cabMeetingGr = new GlideRecord('cab_meeting');
	if (!cabMeetingGr.get(agendaItemGr.getValue('cab_meeting')))
		return new sn_ws_err.NotFoundError("CAB Meeting for the given Agenda Item not found");

	var cabMeeting = new CABMeeting(cabMeetingGr);
	if (cabMeeting.getAgendaItemCount() !== 0) {
		var orderNumber = agendaItemGr.getValue('order');
		var currentItemGr;
		var runtimeMeeting = new GlideRecord('cab_runtime_state');
		runtimeMeeting.addQuery('cab_meeting',agendaItemGr.getValue('cab_meeting'));
		runtimeMeeting.query();

		if (!runtimeMeeting.hasNext())
			return new sn_ws_err.NotFoundError("CAB Meeting's Runtime State for the given Agenda Item not found");

		runtimeMeeting.next();
		currentItemGr = runtimeMeeting.current_agenda_item.getRefRecord();
		var firstPendingItemOrder = cabMeeting.getFirstPendingAgendaItemOrder();
		if (!currentItemGr.isValidRecord())
			orderNumber = firstPendingItemOrder - 10;
		else {
			var currentItemOrder = parseInt(currentItemGr.getValue('order'));
			if (firstPendingItemOrder - currentItemOrder <= 1) {
				cabMeeting.redistributeOrderNumbers();
				firstPendingItemOrder = cabMeeting.getFirstPendingAgendaItemOrder();
				currentItemOrder = parseInt(currentItemGr.getValue('order'));
			}
			orderNumber =  parseInt(currentItemOrder + ((firstPendingItemOrder - currentItemOrder) / 2));
		}
		agendaItemGr.setValue('order', orderNumber);
		agendaItemGr.update();
	} else
		return new sn_ws_err.BadRequestError("Cannot promote Agenda Item. There aren't any pending Agenda Items in the CAB Meeting of the given Agenda Item");

	response.setContentType('application/json');
	response.setBody({promoteState: 'true'});
	response.setStatus(202);
	return response;
})(request, response);
