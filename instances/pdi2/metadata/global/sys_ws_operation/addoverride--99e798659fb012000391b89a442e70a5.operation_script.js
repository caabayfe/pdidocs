(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	
	var startSpanDate = request.queryParams.start_date_time;
	var endSpanDate = request.queryParams.end_date_time ;
	var userId = request.queryParams.user_id;
	var rosterIds = request.queryParams.roster_id + "";
	var groupId = request.queryParams.group_id + "";
	var format = request.queryParams.format + "";
	var onCallCommon = new OnCallCommon();
	return onCallCommon.addOverride(startSpanDate, endSpanDate, userId, rosterIds, groupId, format);
	
})(request, response);
