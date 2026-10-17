(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	if (!request.body.hasNext())
		return new sn_ws_err.BadRequestError("illegal deleteDetails payload");

	var deleteDetails = request.body.nextEntry();
	if (!deleteDetails)
		return new sn_ws_err.BadRequestError("deleteDetails malformed or null");

	var chgSocSysId = deleteDetails.chg_soc_definition;
	if (!chgSocSysId)
		return new sn_ws_err.BadRequestError("deleteDetails malformed or null chgSocSysId: " + chgSocSysId);

	var gr = new GlideRecordSecure("chg_soc_definition");
	if (!gr.get(chgSocSysId))
		return new sn_ws_err.BadRequestError("chg_soc_definition: " + chgSocSysId + " record not found");

	return new SoCDefinition(gr).deleteRecord();
})(request, response);
