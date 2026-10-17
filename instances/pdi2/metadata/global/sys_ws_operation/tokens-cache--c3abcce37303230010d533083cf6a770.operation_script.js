(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	var tokenType = request.pathParams.token_type;

	// block unauthorized users from accessing resource; tokenType is either sys_script_include or sys_db_object
	if (!new GlideRecordSecure(tokenType).canRead())
		return new sn_ws_err.BadRequestError('User is not authorized');

	var name = request.queryParams["name"] && request.queryParams["name"][0];
	var result;
	if(name)
		result = new SNC.GlideScriptEditorContextMenuUtil().getSysIdForName(tokenType, name);
	else
		result = new SNC.GlideScriptEditorContextMenuUtil().getCachedTokens(tokenType);

	response.setBody({'result':result});
	response.setStatus(200);

})(request, response);
