var LicensingEngineGlobalNavMenuHelper = Class.create();
LicensingEngineGlobalNavMenuHelper.prototype = {

    initialize: function() {
        this._licensingEngineGlobalHelper = new LicensingEngineGlobalHelper();
    },

    /**
     * enable "all" SMv1 app modules for 'com.snc.usage_admin.snc', 'com.snc.usage_admin.base' plugin
     */
    enableAllSMv1Modules: function() {
        var smv1Source = ['com.snc.usage_admin.snc', 'com.snc.usage_admin.base'];
        var addQuery = {
            'sys_package.source': smv1Source
        };
        var setValue = {
            'active': true
        };
        this._licensingEngineGlobalHelper._updateSMProtectedRecord('sys_app_module', addQuery, setValue);
    },

    /**
     * disable "all" SMv1 app modules for 'com.snc.usage_admin.snc', 'com.snc.usage_admin.base' plugin
     */
    disableAllSMv1Modules: function() {
        this._licensingEngineGlobalHelper.disableAllSMv1Modules();
    },

    /**
     * enable all app modules for "sn_sub_man" scoped app
     */
    enableAllSMv2Modules: function() {
        this._licensingEngineGlobalHelper.enableAllSMv2Modules();
    },

    /**
     * disable all app modules for "sn_sub_man" scoped app
     */
    disableAllSMv2Modules: function() {
        this._licensingEngineGlobalHelper.disableAllSMv2Modules();
    },

    type: 'LicensingEngineGlobalNavMenuHelper'
};
