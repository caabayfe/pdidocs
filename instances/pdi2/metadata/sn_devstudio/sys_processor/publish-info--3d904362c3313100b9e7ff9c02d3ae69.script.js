getUploadInfo(g_processor, g_request);

function getUploadInfo(g_processor, g_request) {
	var appId = g_request.getParameter("sysparm_sys_id");
	var warningMsg = checkAppDependencies();
	var vendorInfo = new sn_appauthor.ScopedAppVendorInfoObtainer().obtainFromAppRepo();

	if (gs.nil(vendorInfo)) {
		CacheBuster.addNoCacheHeaders(g_response);
		g_processor.writeOutput("application/json", new global.JSON().encode({}));
		return;
	}

	var key = vendorInfo.key || '';
	var company = vendorInfo.name || '';
	var allowInternalUpload = vendorInfo.allow_internal_upload || false;
	var allowStoreUpload = vendorInfo.allow_store_upload || false;
	var allowCustomizationUpload = vendorInfo.allow_customization_upload || false;
	var appCustomizationVersion = sn_app_customization.AppCustomizationAPI.getAppCustomizationVersionById(appId) || '';

	var canPublishToRepo;
	var canPublishToStore;
	var isAppCustomizationCapable;
	try {
		canPublishToRepo = sn_app_api.AppStoreAPI.canPublishToAppRepo(appId) || false;
		isAppCustomizationCapable = sn_app_customization.AppCustomizationAPI.isAppCustomizationCapableById(appId) || false;
		canPublishToStore = (sn_app_api.AppStoreAPI.canPublishToAppStore(appId) && !isAppCustomizationCapable) || false;
	} catch (e) { // check if the use has sn_devstudio.admin role in case AppStoreAPI is not available
		canPublishToRepo = gs.hasRole('sn_devstudio.admin') || false;
		canPublishToStore = gs.hasRole('sn_devstudio.admin') || false;
	}

	if (isAppCustomizationCapable) {
		var storeAppRec = new GlideRecord("sys_store_app");
		storeAppRec.get(appId);
		key = storeAppRec.getValue('vendor_prefix');
		company = storeAppRec.getValue('vendor');

		if (gs.nil(key) && gs.nil(company) && sn_app_customization.AppCustomizationAPI.isInstalledPlugin(appId)) {
			company = 'ServiceNow';
			key = 'sn';
		}
	}

    isJumbo = sn_jumbo_app.JumboAppAPI.isAllowPublishAllScopes() && sn_jumbo_app.JumboAppAPI.isJumboPluginByScopedId(appId);

    var scopes = '';
    if (isJumbo) {
        dirty_sc_scopes = sn_jumbo_app.JumboAppAPI.getAllScopeNamesUnderScopedIdWithUncommitedChanges(appId);
        all_scopes = sn_jumbo_app.JumboAppAPI.getScopes(appId);
    } else {
		dirty_sc_scopes = "";
		all_scopes = "";
	}

	var json = {
		"targetUrl" : getUploadUrls(),
		"ck" : gs.getSession().getSessionToken(),
		"dependencyWarningMsg" : warningMsg,
		"companyKey" : key,
		"companyName" : company,
		"allowInternalUpload" : allowInternalUpload,
		"allowStoreUpload" : allowStoreUpload,
		"allowCustomizationUpload" : allowCustomizationUpload,
		"canPublishToRepo" : canPublishToRepo,
		"canPublishToStore" : canPublishToStore,
		"isAppCustomizationCapable" : isAppCustomizationCapable,
		"appCustomizationVersion" : appCustomizationVersion,
		"isJumbo" : isJumbo,
		"dirty_sc_scopes" : dirty_sc_scopes,
		"all_scopes": all_scopes,
	};
	
	CacheBuster.addNoCacheHeaders(g_response);
	g_processor.writeOutput("application/json", new global.JSON().encode(json));
}

function checkAppDependencies() {
	var appId = g_request.getParameter("sysparm_sys_id");
	if(!appId)
		return gs.getMessage('The application identifier is invalid');
			
	var dependencyChecker = new sn_appauthor.ScopedAppDependencyChecker();
	var inaccessibleApps = dependencyChecker.checkInaccessibleDeps(appId);
	
	var warningMsg = '';
	if (!gs.nil(inaccessibleApps)) {
		warningMsg = gs.getMessage('The application has dependencies which are not accessible in the App Repository: {0}. Do you want to continue?', [inaccessibleApps]);
	}
	
	return warningMsg;
}

function checkAppVersion() {
	var versionInfo, local_version, warningMsg = '';
	var appId = g_request.getParameter("sysparm_sys_id");
	if(!appId)
		appId = "ZZYYTHISISANINVALIDIDWOOOOOOYYZZ";
	
	var gr = new GlideRecord('sys_app');
	if (gr.get(appId)) {
		local_version = gr.getValue('version')||'';
		versionInfo = new sn_appauthor.ScopedAppVendorInfoObtainer()
							  .obtainDisplayVersionFromAppRepo(appId, local_version, false);
		
		if (!versionInfo.allowed && versionInfo.errorMessage) {
			gs.error("Unable to upload this version. Error is " + versionInfo.errorMessage);
			warningMsg = versionInfo.errorMessage;
		}
	}
	
	if(warningMsg)
		warningMsg = gs.getMessage('The application version {0} already exists on the repository. To Publish, you will need to increment the version on the next page.', local_version);
	
	return warningMsg;
}

function getUploadUrls() {
	var uploadUrl = gs.getProperty("sn_appclient.upload_base_url") || gs.getProperty("sn_appauthor.upload_base_url") || '';
	
	if (gs.nil(uploadUrl)) {
		var devUrl = gs.getProperty("sn_appclient.dev_repository_base_url");
		var prodUrl = gs.getProperty("sn_appclient.repository_base_url");
		var isDev = gs.getProperty("glide.installation.developer", "false") == "true";
		uploadUrl = isDev ? devUrl : prodUrl;
	}
	
	if (!uploadUrl.endsWith("/"))
		uploadUrl += "/";
	
	return uploadUrl.split(',');
}
