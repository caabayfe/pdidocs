(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    // implement resource here
	var appSysId = request.pathParams.application_sys_id;
	
	if (!appSysId) {
		throw new sn_ws_err.ServiceError()
			.setStatus(400)
			.setMessage(gs.getMessageLang("No application sys id passed as a parameter.", "en"))
			.setDetail(gs.getMessage("No application sys id passed as a parameter."));
	}
	
	try {
		new AppPromotionAISearchPublishing().publish(appSysId);
	} catch (err) {
		gs.error("App promotion publishing had an issue: " + err.toString());
	}

	response.setStatus(200);
})(request, response);
