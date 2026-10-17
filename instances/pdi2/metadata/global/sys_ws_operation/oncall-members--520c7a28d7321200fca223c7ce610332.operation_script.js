(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	var groupId = request.queryParams.group_id;
	var startDateTime = request.queryParams.start_date_time;
	var endDateTime = request.queryParams.end_date_time;
	var rotaId = request.queryParams.rota_id;
	var rosterId = request.queryParams.roster_id;
	var isOnCall = !JSUtil.nil(request.queryParams.is_on_call) ? request.queryParams.is_on_call : false;
	
	if (request.queryParams.start_date_time == "") {
		startDateTime = new GlideDateTime();
		startDateTime = startDateTime.getDisplayValue();
	}
		
	if (request.queryParams.end_date_time == "") {
		endDateTime = new GlideDateTime(startDateTime);
		endDateTime.add(1000);
		endDateTime = endDateTime.getValue();
	}
	
	var ocGroup = new OCGroup()
		.setCheckAccess(true)
		.setGroupId(groupId)
		.setStartDateTime(startDateTime)
		.setEndDateTime(endDateTime)
		.setRotaIds(rotaId)
		.setRosterIds(rosterId);
	if (isOnCall)
		return ocGroup.getOnCallMembers();
	return ocGroup.getAvailableMembers();
})(request, response);
