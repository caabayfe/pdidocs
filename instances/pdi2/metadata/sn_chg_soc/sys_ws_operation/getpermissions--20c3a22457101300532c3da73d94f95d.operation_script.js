
(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	var sysId = "";
	if (request.body.hasNext())
		sysId = request.body.nextEntry().sys_id + "";
	var gr = new GlideRecordSecure("chg_soc_definition");
	if (!sysId || !gr.get(sysId))
		return new sn_ws_err.BadRequestError("chg_soc_definition: " + sysId + " record not found");
	return new SoCDefinition(gr).getPermissions();
})(request, response);
