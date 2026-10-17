(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
 	if (!request.body.hasNext())
		return new sn_ws_err.BadRequestError("illegal payload");

	var sysId = "";
	var query = "";
	if (request.body.hasNext()) {
		var entry = request.body.nextEntry();
		sysId = entry.sys_id + "";
		query = entry.query + "";
	}

	var gr = new GlideRecordSecure("chg_soc_definition");
	if (!sysId || !query || !gr.get(sysId))
		return new sn_ws_err.BadRequestError("chg_soc_definition: " + sysId + " record not found");

	return new SoCDefinition(gr).getSuggestions(query);
})(request, response);
