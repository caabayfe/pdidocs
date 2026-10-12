var AppEngineUsageNavHelper = Class.create();

(function() {
    AppEngineUsageNavHelper.setAppEngineV1Nav = function(isAppEngineV1) {
        var APP_ENGINE_USAGE_NAV_SYS_ID = "e504392b9f211210940109923b0a1c62";

        var sysAppModule = new GlideRecord("sys_app_module");
        sysAppModule.get(APP_ENGINE_USAGE_NAV_SYS_ID);

        if (!sysAppModule.isValidRecord()) {
            return;
        }
        sysAppModule.setValue("active", isAppEngineV1);
        sysAppModule.setWorkflow(false);
        sysAppModule.update();
        sysAppModule.setWorkflow(true);
    };

    AppEngineUsageNavHelper.prototype = {
        initialize: function() {
            throw 'Not supported';
        },
        type: 'AppEngineUsageNavHelper',
    };
})();
