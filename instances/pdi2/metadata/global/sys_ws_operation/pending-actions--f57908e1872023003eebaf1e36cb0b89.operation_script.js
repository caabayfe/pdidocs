(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	var groupSysId = request.queryParams.group_id + "";
	if (!groupSysId)
		return new sn_ws_err.BadRequestError("Group id not provided");
	var rotaIds = [];
	if (groupSysId) {
		var rotaGr = new GlideRecord("cmn_rota");
		rotaGr.addQuery("group", groupSysId);
		rotaGr.query();
		while (rotaGr.next()) {
			rotaIds.push(rotaGr.getUniqueValue());
		}
	}
	var ocSecurityNG = new global.OnCallSecurityNG();
	var isManager = ocSecurityNG.rotaMgrAccess(groupSysId);
	if (!isManager) {
		var respError = new sn_ws_err.ServiceError();
		respError.setStatus(403);
		respError.setMessage("Security constraints prevent access to requested resource");
		return respError;
	}

	var from = JSUtil.nil(request.queryParams.from_date) ? new GlideDate().getDisplayValueInternal() : request.queryParams.from_date;
	var to = JSUtil.nil(request.queryParams.to_date) ? new GlideDate().getDisplayValueInternal() : request.queryParams.to_date;
	var dateDiff = gs.dateDiff(from, to, true);
	var dateDiffInDays = parseInt(dateDiff / (24 * 60 * 60));
	var maxOddityDuration = parseInt(gs.getProperty("com.snc.on_call_rotation.oddity_max_days", "30"));
	if (JSUtil.nil(dateDiff) || dateDiff < 0) {
		gs.addErrorMessage(gs.getMessage("Invalid start and end time provided"));
		return {};
	}

	var providedOddityDuration = parseInt(dateDiffInDays / (24 * 60 * 60));
	if (providedOddityDuration > maxOddityDuration) {
		gs.addErrorMessage(gs.getMessage("Pending actions can not be fetched for more than {0} days", maxOddityDuration));
		return {};
	}
	var formatterClass = OCFormatterMapping.formatters["dhtmlx"];
	var formatter = new formatterClass();

	var ocrRotaV2 = new OCRotationV2(null, formatter);
	var spans = ocrRotaV2
		.setStartDate(from)
		.setEndDate(to, false)
		.setGroupIds(groupSysId)
		.setRotaIds(rotaIds.join(','))
		.getSpans();

	var memberSpansBeforeExclude = ocrRotaV2.getMemberSpansBeforeExclude();

	var result = {};
	var oc = new OCOddityChecker();
	result.gaps = oc.getGaps(from, to, groupSysId, dateDiffInDays, spans, memberSpansBeforeExclude);
	result.oddities = oc.getConflictsInGroup(from, to, groupSysId, dateDiffInDays, spans);
	result.time_off_requests = oc.getPendingTimeOffRequests();

	var isConflictingOverlapInGroup = oc.isConflictingOverlapInGroup(from, to, groupSysId);
	if (isConflictingOverlapInGroup) {
		gs.addErrorMessage(gs.getMessage("This group has overlapping Shift but 'Allow overlap' preference is set to No"));
	}
	return result;
})(request, response);
