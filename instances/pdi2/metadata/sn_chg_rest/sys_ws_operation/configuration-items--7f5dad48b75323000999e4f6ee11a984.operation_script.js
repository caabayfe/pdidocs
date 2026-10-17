(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	var changeSysId = request.pathParams.change_sys_id || "";
	if (!changeSysId)
		return new sn_ws_err.BadRequestError("Change Request id not provided");

	var changeRequestGr = new GlideRecordSecure(global.ChangeRequest.CHANGE_REQUEST);
	changeRequestGr.addQuery("sys_id", changeSysId);
	changeRequestGr.query();
	if (!changeRequestGr.next())
		return new sn_ws_err.NotFoundError("Change Request not found");

	var nameValuePairs = global.ChangeCommon.assign({}, request.queryParams);
	if (!nameValuePairs.association_type || (nameValuePairs.association_type + "" !== global.ChangeCIAssociation.AFFECTED && nameValuePairs.association_type + "" !== global.ChangeCIAssociation.IMPACTED && nameValuePairs.association_type + "" !== global.ChangeCIAssociation.OFFERING))
		return new sn_ws_err.BadRequestError(
			gs.getMessage("No association_type provided. Please provide association_type: {0}|{1}|{2}", [
				global.ChangeCIAssociation.AFFECTED,
				global.ChangeCIAssociation.IMPACTED,
				global.ChangeCIAssociation.OFFERING
		]));

	return global.ChangeCommon.getWindow(new global.ChangeProcess(changeRequestGr).getCIs(nameValuePairs.association_type + ""), nameValuePairs.sysparm_limit || null, nameValuePairs.sysparm_offset || null);
})(request, response);
