(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	var changeSysId = request.pathParams.change_sys_id || "";
	if (!changeSysId)
		return new sn_ws_err.BadRequestError("Change Request id not provided");

	var changeRequestGr = new GlideRecordSecure(global.ChangeRequest.CHANGE_REQUEST);
	if (!changeRequestGr.get(changeSysId))
		return new sn_ws_err.NotFoundError("Change Request not found");

	var nameValuePairs = global.ChangeCommon.assign({}, request.queryParams, request.body.data);
	nameValuePairs.task = changeSysId;

	if (typeof nameValuePairs.cmdb_ci_sys_ids === "string")
		nameValuePairs.cmdb_ci_sys_ids = nameValuePairs.cmdb_ci_sys_ids.split(",");

	var badCmdbCiSysIds = [];
	if (Array.isArray(nameValuePairs.cmdb_ci_sys_ids)) {
		// Remove empty elements e.g. split on emtpy string returns an array with an empty string as first element
		nameValuePairs.cmdb_ci_sys_ids = nameValuePairs.cmdb_ci_sys_ids.filter(function(e){ return e; });

		// Remove duplicates
		nameValuePairs.cmdb_ci_sys_ids = nameValuePairs.cmdb_ci_sys_ids.filter(global.ChangeCommon.filters.unique);

		// Collect bad cmdb_ci_sys_ids
		badCmdbCiSysIds = nameValuePairs.cmdb_ci_sys_ids.filter(function(sysId) { return !global.ChangeCommon.filters.sysId(sysId); });

		// retain only well formatted sys ids
		nameValuePairs.cmdb_ci_sys_ids = nameValuePairs.cmdb_ci_sys_ids.filter(global.ChangeCommon.filters.sysId);
	}

	if (!Array.isArray(nameValuePairs.cmdb_ci_sys_ids) || nameValuePairs.cmdb_ci_sys_ids.length === 0) {
		var errMsg = gs.getMessage("List of Configuration Item ids not provided. Please provide a list of CI ids to parameter: cmdb_ci_sys_ids.");
		if (Array.isArray(badCmdbCiSysIds) && badCmdbCiSysIds.length > 0)
			errMsg = gs.getMessage("List of Configuration Item ids not provided. Please provide a list of CI ids to parameter: cmdb_ci_sys_ids. Bad cmdb_ci_sys_ids disregarded: {0}", [badCmdbCiSysIds.join(",")]);

		return new sn_ws_err.BadRequestError(errMsg);
	}

	// The limit parameter defaults to 10,000 records. This limit can be set to any value. Be aware, however, that an unusually large value can impact system performance.
	var maxLimit = parseInt(nameValuePairs.sysparm_limit) || 10000;

	var ignoredCmdbCiSysIds = nameValuePairs.cmdb_ci_sys_ids.slice(maxLimit - 1, nameValuePairs.cmdb_ci_sys_ids.length);
	nameValuePairs.cmdb_ci_sys_ids = nameValuePairs.cmdb_ci_sys_ids.slice(0, maxLimit);

	if (!nameValuePairs.association_type || (nameValuePairs.association_type !== global.ChangeCIAssociation.AFFECTED && nameValuePairs.association_type !== global.ChangeCIAssociation.IMPACTED && nameValuePairs.association_type !== global.ChangeCIAssociation.OFFERING))
		return new sn_ws_err.BadRequestError(
			gs.getMessage("No association_type provided. Please provide association_type: {0}|{1}|{2}", [
				global.ChangeCIAssociation.AFFECTED,
				global.ChangeCIAssociation.IMPACTED,
				global.ChangeCIAssociation.OFFERING
		]));

	var changeManagementWorker = new global.ChangeManagementWorker();
	changeManagementWorker.create(nameValuePairs);

	if (ignoredCmdbCiSysIds.length > 0)
		changeManagementWorker.addWarningMsg(gs.getMessage("Number of CIs/Services has exceeded transaction limit")).update();

	// Add Bad CMDB CI SysIds to Ignored CMDB CI SysIds
	if (Array.isArray(badCmdbCiSysIds) && badCmdbCiSysIds.length > 0)
		ignoredCmdbCiSysIds = badCmdbCiSysIds.concat(ignoredCmdbCiSysIds);

	if (ignoredCmdbCiSysIds.length > 0)
		changeManagementWorker.setResponseParam(global.ChangeCIAssociation.IGNORED_CMDB_CI_SYS_IDS, ignoredCmdbCiSysIds).update();

	// Provide Async link in header
	response.setHeader("Link", changeManagementWorker.getResponseParam("worker").link + "");

	// Allows server to accept request for asynchronous process
	response.setStatus(202);

	return changeManagementWorker.toJS();
})(request, response);
