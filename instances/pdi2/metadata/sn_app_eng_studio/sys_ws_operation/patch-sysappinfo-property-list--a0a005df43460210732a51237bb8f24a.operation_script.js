(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

	try {
		var applicationSysId = request.pathParams.application_sys_id;
		var property = request.pathParams.property;
		var operation = request.pathParams.operation;
		var item = request.body.data.item;

		AccessValidator.verifyApplicationAccess(applicationSysId);

		var sysAppInfoUtils = new SysAppInfoUtils(applicationSysId);
		var isItemInList = true;
		
		if (operation === 'delete') {
			sysAppInfoUtils.removeItemFromList(property, item);
			isItemInList = sysAppInfoUtils.getIsItemInList(property, item);

			if (isItemInList) {
				throw('Unable to remove item from property list: ' + property);
			}

		} else {
			throw('No action defined for operation: ' + operation);
		}
		
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
			default:
				throw new sn_ws_err.ServiceError()
					.setStatus(500)
					.setMessage(gs.getMessageLang("Unhandled exception {0}", "en", [exception]))
					.setDetail(gs.getMessage("Unhandled exception {0}", [exception]));
		}
		
	}

})(request, response);
