(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	if (!request.body.hasNext())
		return new sn_ws_err.BadRequestError("illegal changeSchedDef payload");

	var changeSchedDef = request.body.nextEntry();
	if (!changeSchedDef)
		return new sn_ws_err.BadRequestError("changeSchedDef malformed or null");

	var chgSocSysId = changeSchedDef.chg_soc_definition;
	if (!chgSocSysId)
		return new sn_ws_err.BadRequestError("permission malformed or null chgSocSysId: " + chgSocSysId);

	if (new global.ChangeSoCUtil().hasDynamicCondition(changeSchedDef.condition))
		return new sn_ws_err.BadRequestError(gs.getMessage("is (dynamic) filter operators are not supported"));

	var gr = new GlideRecordSecure("chg_soc_definition");
	if (!gr.get(chgSocSysId))
		return new sn_ws_err.BadRequestError("chg_soc_definition: " + chgSocSysId + " record not found");

	return new SoCDefinition(gr).updateSchedule(changeSchedDef);
})(request, response);
