(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	if (!request.body.hasNext())
		return new sn_ws_err.BadRequestError("illegal copyDetails payload");

	var copyDetails = request.body.nextEntry();
	if (!copyDetails)
		return new sn_ws_err.BadRequestError("copyDetails malformed or null");

	var chgSocSysId = copyDetails.chg_soc_definition;
	var name = copyDetails.name;
	var owner = copyDetails.owner;
	if (!chgSocSysId || !name || !owner)
		return new sn_ws_err.BadRequestError("copyDetails malformed or null chgSocSysId: " + chgSocSysId + " name: " + name + " owner: " + owner);

	var gr = new GlideRecordSecure("chg_soc_definition");
	if (!gr.get(chgSocSysId))
		return new sn_ws_err.BadRequestError("chg_soc_definition: " + chgSocSysId + " record not found");

	return new SoCDefinition(gr).copy(name, owner);
})(request, response);
