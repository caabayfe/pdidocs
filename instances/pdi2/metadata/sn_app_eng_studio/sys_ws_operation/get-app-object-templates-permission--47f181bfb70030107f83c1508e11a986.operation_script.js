(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    
	try {
		
        var applicationSysId = request.pathParams.application_sys_id;
		
		AccessValidator.verifyApplicationAccess(applicationSysId);
		
        var appObjectTemplatesPermission = {};
        var templateManifestRecords = new GlideRecord("sys_app_template_manifest");
        templateManifestRecords.addJoinQuery("sys_app_template");
        templateManifestRecords.addQuery("template.active", true);
        templateManifestRecords.addQuery("template.create_app", false);
        templateManifestRecords.query();

        while (templateManifestRecords.next()) {
            var tableName = templateManifestRecords.table_name.getRefRecord().getValue("name");
            var templateID = templateManifestRecords.getValue('template');
            var now_GR = new GlideRecord(tableName);

            if (!now_GR.canCreate()) {
                appObjectTemplatesPermission[templateID] = false;
            } else if (appObjectTemplatesPermission[templateID] !== false) {
                appObjectTemplatesPermission[templateID] = true;
            }
        }

		var result = {};
		result[applicationSysId] = appObjectTemplatesPermission;
        response.setStatus(200);
        response.setBody(result);
    
	} catch (exception) {

        switch (exception) {

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
