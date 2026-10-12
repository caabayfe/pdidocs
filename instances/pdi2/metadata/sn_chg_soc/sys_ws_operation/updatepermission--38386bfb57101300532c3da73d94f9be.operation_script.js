(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	if (!request.body.hasNext())
		return new sn_ws_err.BadRequestError("illegal identityDetails payload");

	var permission = request.body.nextEntry();
	if (!permission)
		return new sn_ws_err.BadRequestError("permission malformed or null");

	var chgSocSysId = permission.chg_soc_definition;
	var everyone = permission.everyone;
	if (!chgSocSysId)
		return new sn_ws_err.BadRequestError("permission malformed or null chgSocSysId: " + chgSocSysId + " everyone: " + everyone);

	var gr = new GlideRecordSecure("chg_soc_definition");
	if (!gr.get(chgSocSysId))
		return new sn_ws_err.BadRequestError("chg_soc_definition: " + chgSocSysId + " record not found");

	return new SoCDefinition(gr).updatePermission(everyone);
})(request, response);
