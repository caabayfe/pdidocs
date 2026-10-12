(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	var scopeNames = request.queryParams.scope_name? request.queryParams.scope_name[0] : null;
	
	if(!scopeNames) {
		throw new sn_ws_err.ServiceError()
				.setStatus(400)
				.setMessage(gs.getMessageLang("Missing required query param: scope_name", "en"))
				.setDetail(gs.getMessage("Missing required query param: scope_name"));
	}
	
	function getUserImage(glideRecord, imageField) {
		var image = glideRecord.getDisplayValue(imageField);
		if (image) {
			return '/' + image;
		}
		return null;
	}
	
	var scopeGr = new GlideRecord("sys_scope");
	scopeGr.addQuery("scope", "IN", scopeNames);
	
	scopeGr.query();
	
	var scopeRecords = [];
	while(scopeGr.next()) {
		scopeRecords.push({
			scope: scopeGr.getValue("scope"),
			name: scopeGr.getDisplayValue("name"),
			sys_id: scopeGr.getValue("sys_id"),
			logo: getUserImage(scopeGr, "logo")
		});
	}
	
	response.setBody(scopeRecords);
	response.setStatus(200);
})(request, response);
