(function process(request, response) {
    getUploadInfo(request, response);

    function getUploadInfo(request, response) {
        var appId = getParam(request, "sysparm_sys_id");
        var warningMsg = checkAppDependencies(request);
        var vendorInfo = new sn_appauthor.ScopedAppVendorInfoObtainer().obtainFromAppRepo();

        if (gs.nil(vendorInfo)) {
            addNoCacheHeaders(response);
            response.setContentType("application/json");
            response.setBody({});
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
        } catch (e) {
            canPublishToRepo = false;
            canPublishToStore = false;
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

        var isJumbo = sn_jumbo_app.JumboAppAPI.isAllowPublishAllScopes() && sn_jumbo_app.JumboAppAPI.isJumboPluginByScopedId(appId);

        var dirty_sc_scopes;
        var all_scopes;
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
            "all_scopes": all_scopes
        };

        addNoCacheHeaders(response);
        response.setContentType("application/json");
        response.setBody(json);
    }

    function checkAppDependencies(request) {
        var appId = getParam(request, "sysparm_sys_id");
        if (!appId)
            return gs.getMessage('The application identifier is invalid');

        var dependencyChecker = new sn_appauthor.ScopedAppDependencyChecker();
        var inaccessibleApps = dependencyChecker.checkInaccessibleDeps(appId);

        var warningMsg = '';
        if (!gs.nil(inaccessibleApps)) {
            warningMsg = gs.getMessage('The application has dependencies which are not accessible in the App Repository: {0}. Do you want to continue?', [inaccessibleApps]);
        }

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

    function getParam(request, name) {
        var values = request.queryParams[name];
        return (values && values.length) ? values[0] : null;
    }

    function addNoCacheHeaders(response) {
        response.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
        response.setHeader("Pragma", "no-cache");
        response.setHeader("Expires", "0");
    }

})(request, response);
