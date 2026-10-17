(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	
	var startSpanDate = request.queryParams.start_date_time;
	var endSpanDate = request.queryParams.end_date_time ;
	var userId = request.queryParams.user_id;
	var rosterId = request.queryParams.roster_id + "";
	var groupId = request.queryParams.group_id + "";
	var tableName = request.queryParams.table + "";
	var sysId = request.queryParams.sys_id + "";
	var format = request.queryParams.format + "";
	var onCallCommon = new OnCallCommon();
	return onCallCommon.replaceCoverage(startSpanDate, endSpanDate, userId, rosterId, groupId, tableName, sysId, format);
	
})(request, response);
