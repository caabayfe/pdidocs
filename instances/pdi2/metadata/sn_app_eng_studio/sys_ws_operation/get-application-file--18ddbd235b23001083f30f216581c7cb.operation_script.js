(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    try {
		var tableName = request.pathParams.table_name;
		var applicationSysId = request.pathParams.application_sys_id;

		// Comma seperated list of object sys_ids
		var objectSysIds = request.pathParams.object_sys_ids;
		var objectSysIdArray= objectSysIds.split(',');
		
		var files = ApplicationFileBuilder.build(applicationSysId, objectSysIdArray, tableName);
		
		if (files.length == 0) {
			throw CreatorStudioConstants.errors.APPLICATION_FILE_DOES_NOT_EXIST;
		}

		response.setBody(files);
		response.setStatus(200);
		
	} catch (exception) {
		
		switch(exception) {
		
			case CreatorStudioConstants.errors.APPLICATION_DOES_NOT_EXIST:
				throw new sn_ws_err.ServiceError()
					.setStatus(404)
					.setMessage(gs.getMessageLang("Application, with sys_id {0}, does not exist", "en", [applicationSysId]))
					.setDetail(gs.getMessage("Application, with sys_id {0}, does not exist", [applicationSysId]));
				
			case CreatorStudioConstants.errors.APPLICATION_ACCESS_DENIED:
				throw new sn_ws_err.ServiceError()
					.setStatus(403)
					.setMessage(gs.getMessageLang("Access to application, with sys_id {0}, is denied", "en", [applicationSysId]))
					.setDetail(gs.getMessage("Access to application, with sys_id {0}, is denied", [applicationSysId]));
				
			case CreatorStudioConstants.errors.APPLICATION_FILE_DOES_NOT_EXIST:
				throw new sn_ws_err.ServiceError()
					.setStatus(404)
					.setMessage(gs.getMessageLang("Application object with sys_id(s) {0} does not exist", "en", [objectSysIds]))
					.setDetail(gs.getMessage("Application object with sys_id(s) {0} does not exist", [objectSysIds]));
				
			case CreatorStudioConstants.errors.TAXONOMY_DOES_NOT_EXIST:
				throw new sn_ws_err.ServiceError()
					.setStatus(404)
					.setMessage(gs.getMessageLang("Taxonomy with table_name {0} does not exist", "en", [tableName]))
					.setDetail(gs.getMessage("Taxonomy with table_name {0} does not exist", [tableName]));
				
			default:
				throw new sn_ws_err.ServiceError()
					.setStatus(500)
					.setMessage(gs.getMessageLang("Unhandled exception {0}", "en", [exception]))
					.setDetail(gs.getMessage("Unhandled exception {0}", [exception]));
		
		}
		
	}

})(request, response);
