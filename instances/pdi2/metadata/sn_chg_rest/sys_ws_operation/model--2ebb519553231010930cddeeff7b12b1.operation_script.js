(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	var sysId = request.pathParams.sys_id || null;
	if (!sysId)
		return new sn_ws_err.BadRequestError("Change Model id not provided");

	var changeModelsGr = new GlideRecordSecure("chg_model");
	if (!changeModelsGr.get(sysId))
		return new sn_ws_err.NotFoundError("Change Model not found");

	return global.ChangeCommon.toJS(changeModelsGr);
})(request, response);
