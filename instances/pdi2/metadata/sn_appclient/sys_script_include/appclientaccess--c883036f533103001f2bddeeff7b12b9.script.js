var AppClientAccess = Class.create();
AppClientAccess.prototype = {
    initialize: function() {
    },

	hasReadAccessSysStoreApp: function(current) {
		return (gs.isScopeAdminForAnyApp() ||
				gs.hasRole("sn_appclient.app_client_user") ||
				gs.hasRole("sn_appclient.app_client_company_installer") || 
				gs.hasRole("unified_plugin_read_only") || this.canUpgradeAnyStoreApp()) &&
			(current.getValue("private") != 1);
	},

	/* check if the current use has the delegated permission to upgrade any store app*/
	canUpgradeAnyStoreApp: function() {
		if (GlidePluginManager.isActive("com.glide.app_api")) {
			if (typeof sn_app_api.AppStoreAPI.canUpgradeAnyStoreApp != "undefined")
				return sn_app_api.AppStoreAPI.canUpgradeAnyStoreApp();
		}

		// If API is not available, check if the customer has admin role instead
		return gs.hasRole('admin') || false;
	},

    isStoreSessionAlive: function(username,password){
        var loginCheckRequest = new ScopedAppRepoRequest("check_login" , {
            "use_cookies" : "true"
        });
            loginCheckRequest.setParameter("instance_id", gs.getProperty("instance_id"));
        if (!gs.nil(username) && !gs.nil(password))
            loginCheckRequest.setBasicAuth(username,password);
        var loginResponse = loginCheckRequest.post();
        var loginStatusCode = loginCheckRequest.getStatusCode();
        var response = {};
        if (loginStatusCode == 200 || loginStatusCode == 403) {
            response.data = JSON.parse(loginResponse);
            if (loginStatusCode == 403) //adding localised message
                response.data.error = gs.getMessage("The instance you are trying to login from doesn't belong to your company. Please contact Servicenow for more information.");
        }
        response.statusCode = loginStatusCode;
        return response;
    },

    type: 'AppClientAccess'
};
