(function process(request, response) {
	var agendaItemId = request.pathParams.agendaItemId;
	var request_body = request.body.nextEntry();
	var actionName = request_body.action;
	var userId = request_body.userId;
	
	if (!agendaItemId) 
		return new sn_ws_err.BadRequestError("Agenda Item id not provided");

	if (!actionName || (actionName != "add" && actionName !="remove")) 
		return new sn_ws_err.BadRequestError("Invalid action provided - must be either 'add' or 'remove'");

	if (!userId)
		return new sn_ws_err.BadRequestError("User id not provided");
	
	var agendaItemGr = new GlideRecord('cab_agenda_item');
	if (!agendaItemGr.get(agendaItemId))
		return new sn_ws_err.NotFoundError("Requested Agenda Item not found");

	var userGr = new GlideRecord("sys_user");
	if (!userGr.get(userId))
		return new sn_ws_err.NotFoundError("User not found");

	var notificationRecipients = [];
	if (!agendaItemGr.notification_recipients.nil())
		notificationRecipients = agendaItemGr.getValue("notification_recipients").split(",");
	
	if (actionName == "add")
		if (notificationRecipients.indexOf(userId) < 0)
			notificationRecipients.push(userId);

	if (actionName == "remove") {
		var i = notificationRecipients.indexOf(userId);
		if (i >= 0)
			notificationRecipients.splice(i, 1);
	}
	
	agendaItemGr.notification_recipients = notificationRecipients.toString();

	if (agendaItemGr.update())
		response.setBody({"notification_recipients": agendaItemGr.getValue("notification_recipients")});
	else
		return new sn_ws_err.ServiceError().setMessage("Failed to update agenda item record");
})(request, response);
