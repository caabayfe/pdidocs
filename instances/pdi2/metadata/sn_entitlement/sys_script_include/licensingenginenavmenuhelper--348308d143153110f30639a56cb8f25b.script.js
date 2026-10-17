var LicensingEngineNavMenuHelper = Class.create();
LicensingEngineNavMenuHelper.prototype = {
    initialize: function() {
        this._licensingEngineGlobalNavMenuHelper = new global.LicensingEngineGlobalNavMenuHelper();
    },

    /**
     * enable "all" SMv1 app modules for 'com.snc.usage_admin.snc', 'com.snc.usage_admin.base' plugin
     */
    enableAllSMv1Modules: function() {
        this._licensingEngineGlobalNavMenuHelper.enableAllSMv1Modules();
    },
    /**
     * enable all app modules for "sn_sub_man" scoped app
     */
    enableAllSMv2Modules: function() {
        this._licensingEngineGlobalNavMenuHelper.enableAllSMv2Modules();
    },

    /**
     * disable "all" SMv1 app modules for 'com.snc.usage_admin.snc', 'com.snc.usage_admin.base' plugin
     */
    disableAllSMv1Modules: function() {
        this._licensingEngineGlobalNavMenuHelper.disableAllSMv1Modules();
    },

    /**
     * disable all app modules for "sn_sub_man" scoped app
     */
    disableAllSMv2Modules: function() {
        this._licensingEngineGlobalNavMenuHelper.disableAllSMv2Modules();
    },

    type: 'LicensingEngineNavMenuHelper'
};
