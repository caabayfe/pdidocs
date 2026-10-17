(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	const queryParams = request.queryParams;
	const table = queryParams.table + "";
	const sysId = queryParams.sysId + "";
	const user = queryParams.user + "";
	const source = queryParams.source + "";
	const attributes = queryParams.attributes + "";
	const filterQuery = queryParams.filterQuery + "";

	const atUtils = new sn_at.ActivityTimerUtils();
	const result = atUtils.getDuration(table, sysId, user, source, attributes, filterQuery);
	response.setBody(result);
})(request, response);
