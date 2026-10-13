(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	var groupIds = JSUtil.nil(request.queryParams.group_ids) ? "" : request.queryParams.group_ids;
	var rotaIds = JSUtil.nil(request.queryParams.rota_ids) ? "" : request.queryParams.rota_ids;
	var rosterIds = JSUtil.nil(request.queryParams.roster_ids) ? "" : request.queryParams.roster_ids;
	var dateTime = JSUtil.nil(request.queryParams.date_time) ? new GlideDateTime().getValue() : request.queryParams.date_time;
	return new OnCallRotation().whoIsOnCall(groupIds, rotaIds, rosterIds, dateTime);
})(request, response);
