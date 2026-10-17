(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	var queryParams = request.queryParams;

	var orderBy = "";
	if (typeof queryParams.orderBy !== "undefined")
		orderBy = queryParams.orderBy + "";

	var textSearch = "";
	if (typeof queryParams.textSearch !== "undefined")
		textSearch = queryParams.textSearch + "";

	var encodedQueryObj = global.ChangeCommon.buildEncodedQuery(global.ChangeCommon.assign({}, request.queryParams));
	var result = global.ChangeCommon.getWindow(global.EmergencyChangeProcess.findAll(orderBy, textSearch, encodedQueryObj.encodedQuery), queryParams.sysparm_limit || null, queryParams.sysparm_offset || null);
	result.push({__meta: encodedQueryObj});
	return result;
})(request, response);
