var AppManagerPageConfigurationUtil = Class.create();
AppManagerPageConfigurationUtil.prototype = {
    initialize: function() {},

    getPageConfigurations: function() {
        var result = {};
        result.storeUrl = this.getStoreUrl();
        result.requestPluginSupportUrl = this.getRequestPluginSupportUrl();
        result.userDateFormat = gs.getDateFormat();
        result.userTimeFormat = gs.getTimeFormat();
        result.isMaintUser = gs.hasRole('maint') == true;
        result.isAdminOrAppClientUser = gs.hasRole("admin") || gs.hasRole("sn_appclient.app_client_user");
        result.isAdminUser = gs.hasRole("admin") || gs.hasRole("maint");
        result.isReadOnlyAppUser = gs.hasRole("unified_plugin_read_only") &&
            !gs.hasRole('sn_appclient.app_client_company_installer') &&
            !gs.hasRole("sn_appclient.app_client_user") &&
            !gs.hasRole("admin") &&
            !gs.hasRole("maint");
        new global.PluginsData().getAndClearSessionInfo(['invalid_instance', 'invalid_certificate', 'upload_app_success'], result);
        var instanceMessage = gs.getSession().getClientData('invalid_instance') || "";
        var certMessage = gs.getSession().getClientData('invalid_certificate') || "";
        result.uploadAppErrorMessage = result.invalid_instance || result.invalid_instance.invalid_certificate;
        result.uploadAppSuccessMessage = result.upload_app_success || "";
        result.isSwitchToClassicUiEnabled = gs.getProperty("sn_appclient.switch.to.classic.ui",'false') == 'true';
        result.isInstanceOffline = gs.getProperty("sn_appclient.app.install.offline", 'false') == 'true';
        result.isSyncRequired = result.uploadAppSuccessMessage ? true : false;
        result.appsSyncProgress = gs.getProperty("sn_appclient.apps_sync_progress", 0);
        var lastSyncTime = CommonUtils.getSystemProperty("sn_appclient.apps_last_sync_time", "value");
        var glideDateTime = lastSyncTime ? new GlideDateTime(lastSyncTime) : "";
        result.appsLastSyncTime = glideDateTime ? glideDateTime.getDisplayValueLang("medium") : "";
        result.isProduction = gs.getProperty("sn_appclient.instance_type", "")  == 'production';
        return result;
    },

    getRequestPluginSupportUrl: function() {
        var supportHostUrl = "https://support.servicenow.com/";
        if (this.isGCCInstance()) {
            supportHostUrl = "https://hiwave.servicenowservices.com/";
        }
        return supportHostUrl + "/now?id=ns_automation_store&catalog_sys_id=891f088e465667e234a3cb52ffa1d299";
    },

    getStoreUrl: function() {
        var storeHostUrl = 'https://store.servicenow.com/';
        var instanceId = this.getInstanceId();
        if (this.isGCCInstance()) {
            storeHostUrl = new ScopedAppRepoRequest().getUploadUrl();
        }
        return storeHostUrl + '$appstore.do?ref=appmgmt&instanceid=' + instanceId + '#!/store/home';
    },

    isGCCInstance: function() {
        return gs.getProperty("sn_appclient.is_gcc_instance", "false") == 'true';
    },

    getInstanceId: function() {
        return gs.getProperty("instance_id");
    },

    type: 'AppManagerPageConfigurationUtil'
};
