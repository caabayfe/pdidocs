(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	var table = request.queryParams.table ? request.queryParams.table + "" : "";
	var field = request.queryParams.field ? request.queryParams.field + "" : "";
	var encodedQuery = request.queryParams.encoded_query ? request.queryParams.encoded_query + "" : "";

	if (!table || !field || !encodedQuery)
		return new sn_ws_err.BadRequestError("table, field, and encodedQuery are required");

	if (new global.ChangeSoCUtil().hasDynamicCondition(encodedQuery))
		return new sn_ws_err.BadRequestError(gs.getMessage("is (dynamic) filter operators are not supported"));

    var gr = new GlideRecord(table);
	gr.setLimit(1);
	gr.query();
	gr.next();
	gr.setValue(field, encodedQuery);

	if (!gr.canRead())
		throw new sn_ws_err.BadRequestError("You are either not authorized or record is not valid.");

	return gr.getDisplayValue(field);
})(request, response);
