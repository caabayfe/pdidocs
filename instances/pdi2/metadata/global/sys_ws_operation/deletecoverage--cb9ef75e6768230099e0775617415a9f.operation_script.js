(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	
	var tableName = request.queryParams.table + "";
	var sysId = request.queryParams.sys_id + "";
	var onCallCommon = new OnCallCommon();
	return onCallCommon.deleteCoverage(tableName, sysId);

})(request, response);
