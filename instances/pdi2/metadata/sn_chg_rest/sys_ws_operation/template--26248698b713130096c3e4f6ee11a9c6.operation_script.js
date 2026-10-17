(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	var sysId = request.pathParams.sys_id || null;
	if (!sysId)
		return new sn_ws_err.BadRequestError("Standard Change Template id not provided");

	var standardChangeTemplate = global.StandardChangeTemplate.findById(sysId);
	if (!standardChangeTemplate)
		return new sn_ws_err.NotFoundError("Standard Change Template not found");

	return  standardChangeTemplate.toJS();
})(request, response);
