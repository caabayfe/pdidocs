var AppEngineV1GlobalHelper = Class.create();
(function() {
    /**
     * populates usage tables for app engine v1 product codes
     */
    AppEngineV1GlobalHelper.appEngineV1Populate = function() {
        SNC.UACTScriptUtils.populateUACTTablesForAppEngineV1();
    };

    /**
     * returns boolean for if there are app engine v1 products
     */
    AppEngineV1GlobalHelper.isAppEngineV1 = function() {
        var result = AppEngineV1GlobalHelper.getAppEngineLicensesOnInstance();
        if (result && result.length && result[0].hasOwnProperty("supportsAppEngineV1")) {
            return true;
        }
        return false;
    };

    /**
     * returns app engine v1 products
     */
    AppEngineV1GlobalHelper.getAppEngineLicensesOnInstance = function() {
        try {
            return JSON.parse(SNC.AppEngineLicensingUsage.getAppEngineLicensesOnInstance());
        } catch(e) {
            gs.error("AppEngineLicensingUsage Class failed: " + e.message)
            return [];
        }
    };

    AppEngineV1GlobalHelper.prototype = {
        initialize: function() {
            throw 'Not supported';
        },
        type: 'AppEngineV1GlobalHelper',
    };
})();
