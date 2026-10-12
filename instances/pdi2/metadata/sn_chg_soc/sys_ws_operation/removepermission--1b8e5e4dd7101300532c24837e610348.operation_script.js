(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	if (!request.body.hasNext())
		return new sn_ws_err.BadRequestError("illegal identityDetails payload");

	var identityDetails = request.body.nextEntry();
	if (!identityDetails)
		return new sn_ws_err.BadRequestError("identityDetails malformed or null");

	var chgSocSysId = identityDetails.chg_soc_definition;
	var tableName = identityDetails.tableName;
	var sysId = identityDetails.sys_id;
	if (!chgSocSysId || !tableName || !sysId)
		return new sn_ws_err.BadRequestError("identityDetails malformed or null chgSocSysId: " + chgSocSysId + " tableName: " + tableName + " sysId: " + sysId);

	var gr = new GlideRecordSecure("chg_soc_definition");
	if (!gr.get(chgSocSysId))
		return new sn_ws_err.BadRequestError("chg_soc_definition: " + chgSocSysId + " record not found");

	return new SoCDefinition(gr).removePermission(tableName, sysId);
})(request, response);
