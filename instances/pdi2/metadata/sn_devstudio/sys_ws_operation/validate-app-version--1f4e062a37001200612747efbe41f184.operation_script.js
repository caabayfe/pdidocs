(function process(request, response) {
    var appId = request.pathParams.appId;
	
	var allowed = VCSAppAccessCheck.verifyWriteAccess(appId) && VCSAppAccessCheck.verifyPublishAccess(appId);

    if (!allowed) 
		VCSAppAccessCheck.throwAccessDenied(appId);

    var version = request.body.data.version,
        publishToStore = !!request.body.data.publish_to_store,
        isAppCustomization = !!request.body.data.is_app_customization,
        versionInfo = {},
        appRecord,
        errorMessage,
        body = {};

    var skipVersionCheck = false;
    if (isAppCustomization) {
		var anchorScopeId = appId;
		var scopedPlugin = new GlideRecord('sys_scoped_plugin');
		if (scopedPlugin.isValid()) {
			scopedPlugin.addQuery('scope', appId);
			scopedPlugin.query();
			if (scopedPlugin.next())
				anchorScopeId = scopedPlugin.getValue('parent_scope_id') || appId;
		}

        appRecord = new GlideRecord('sys_app_customization');
        appRecord.addQuery('vendor_app', anchorScopeId);
        appRecord.query();
        if (appRecord.next())
            appId = appRecord.getUniqueValue();
        else
            skipVersionCheck = true;
    }

    versionInfo = new sn_appauthor
        .ScopedAppVendorInfoObtainer()
        .obtainDisplayVersionFromAppRepo(appId, version, publishToStore);

    // We get null back if we can't talk to the repo. assume the number is OK
    // so the user can continue other operations like saving to git
    if (!versionInfo)
        versionInfo = {
            allowed: false,
            errorMessage: gs.getMessage('Unable to validate app version because the app repository is not available.')
        };
    else if (skipVersionCheck)
        versionInfo = {
            allowed: true
        };

    body.allowed = !!versionInfo.allowed;

    if (body.allowed) {

        if (isAppCustomization)
            new sn_appclient.SetAppCustomizationVersion().setVersion(appId, version);
        else {
            appRecord = new GlideRecord('sys_app');

            if (appRecord.get(appId)) {
                appRecord.setValue('version', version);
                appRecord.update();
            }
        }
    } else {
        body.errorMessage = versionInfo.errorMessage || gs.getMessage('Invalid version number');
    }

    response.setBody(body);
    response.setContentType('application/json');
    response.setStatus(200);

})(request, response);
