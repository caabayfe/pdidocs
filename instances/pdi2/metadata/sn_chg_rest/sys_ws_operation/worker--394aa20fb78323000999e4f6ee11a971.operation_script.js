(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	var sysId = request.pathParams.sys_id || "";
	if (!sysId)
		return new sn_ws_err.BadRequestError("Change Management Worker sysId not provided");

	var chgMgtWorkerGr = new GlideRecordSecure(global.ChangeManagementWorker.CHG_MGT_WORKER);
	if (!chgMgtWorkerGr.get(sysId))
		return new sn_ws_err.NotFoundError("Change Management worker not found");

	return new global.ChangeManagementWorker(chgMgtWorkerGr).toJS();
})(request, response);
