(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

	try {
		
		var applicationSysId = request.pathParams.application_sys_id;
		
		// get the list of available apps from the app picker, minus global
		var responseBody = ApplicationInventoryListBuilder.build(applicationSysId);

		response.setBody(responseBody);
		response.setStatus(200);
		
	} catch (exception) {
		
		switch(exception) {
		
			case CreatorStudioConstants.errors.APPLICATION_DOES_NOT_EXIST:
				throw new sn_ws_err.ServiceError()
					.setStatus(404)
					.setMessage(gs.getMessageLang("Application, with sys_id {0}, does not exist", "en", [applicationSysId]))
					.setDetail(gs.getMessage("Application, with sys_id {0}, does not exist", [applicationSysId]));
			case CreatorStudioConstants.errors.INVALID_TAXONOMY_OR_FILE_OBJECT:
				throw new sn_ws_err.ServiceError()
					.setStatus(404)
					.setMessage(gs.getMessageLang("Unable to fetch taxonomy or file object for {0}", "en", [applicationSysId]))
					.setDetail(gs.getMessage("Unable to fetch taxonomy or file object for {0}", [applicationSysId]));
			case CreatorStudioConstants.errors.APPLICATION_ACCESS_DENIED:
				throw new sn_ws_err.ServiceError()
					.setStatus(403)
					.setMessage(gs.getMessageLang("Access to application, with sys_id {0}, is denied", "en", [applicationSysId]))
					.setDetail(gs.getMessage("Access to application, with sys_id {0}, is denied", [applicationSysId]));
			default:
				throw new sn_ws_err.ServiceError()
					.setStatus(500)
					.setMessage(gs.getMessageLang("Unhandled exception {0}", "en", [exception]))
					.setDetail(gs.getMessage("Unhandled exception {0}", [exception]));
		}
		
	}

})(request, response);
