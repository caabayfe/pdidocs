var UAAppInfoDAO = Class.create();
UAAppInfoDAO.prototype = {
    initialize: function() {
        this.logger = new LoggingUtil();
        this.cacheManager = new LicensingCacheManager();
        this.cacheDataHandler = new CacheDataHandler();
        this.cacheColumnList = [
            LicensingEngineDBConstants.ENTITLEMENT_CHECK_OVERRIDE
        ];
        this.cacheRefColumnList = [];
    },

    loadAllDataIntoCache: function() {
        this.loadUAAppInfoDataIntoCache();
    },

    /**
     * Queries ua_app_info table and loads the required data into cache 
     *
     * Each record of ua_app_info will be put in to cache as below
     * [app_id:[uaAppInfoObjMap,uaAppInfoObjMap..]]
     * uaAppInfoObjMap structure would be {entitlement_check_override:String}
     */
    loadUAAppInfoDataIntoCache: function() {
        let uaAppInfoObjMap = this._loadUAAppInfoData();
        this.cacheManager.putDataIntoCache(LicensingEngineConstants.LICENSING_CACHE_CATALOG, LicensingEngineConstants.UA_APP_INFO_CACHE, uaAppInfoObjMap);
    },

    /**
     * Internal method to load UA app info data from database
     * @returns {Map} Map of app_id to UA app info objects
     */
    _loadUAAppInfoData: function() {
        let uaAppInfoObjMap = new Map();
        var uaAppInfoGR = new GlideRecord(LicensingEngineDBConstants.UA_APP_INFO);
        if (uaAppInfoGR.isValid() && uaAppInfoGR.isValidField(LicensingEngineDBConstants.APP_ID) &&
            uaAppInfoGR.isValidField(LicensingEngineDBConstants.ENTITLEMENT_CHECK_OVERRIDE)) {
            uaAppInfoGR.query();
            uaAppInfoObjMap = this.cacheDataHandler.prepareCacheData(uaAppInfoGR, uaAppInfoObjMap, LicensingEngineDBConstants.APP_ID, this.cacheColumnList, this.cacheRefColumnList);
        }
        return uaAppInfoObjMap;
    },

    /**
     * Returns the map of app_id to ua_app_info object
     * Map([ua_app_info.app_id, [{allow_on_customer_subprod = ua_app_info.allow_on_customer_subprod}]])
     * 
     * Each entry of the map would follow below structure:
     * [app_id:[uaAppInfoObjMap,uaAppInfoObjMap..]]
     * uaAppInfoObjMap structure would be {allow_on_customer_subprod:String}
     * 
     * Uses local copy pattern to prevent race condition:
     * - Loads data into local variable (not re-fetched from cache)
     * - Returns local copy even if cache is flushed concurrently
     * - Other threads reload on cache miss (self-healing)
     * 
     * @returns {Map} Map of app IDs to UA app info objects
     */
    getUAAppInfo: function() {
        var data = this.cacheManager.getDataFromCache(LicensingEngineConstants.LICENSING_CACHE_CATALOG, LicensingEngineConstants.UA_APP_INFO_CACHE);
        if (gs.nil(data)) {
            // Load data locally (not from cache)
            data = this._loadUAAppInfoData();
            // Cache for other threads to use
            this.cacheManager.putDataIntoCache(LicensingEngineConstants.LICENSING_CACHE_CATALOG, LicensingEngineConstants.UA_APP_INFO_CACHE, data);
        }
        // Return local variable if cache doesn't exist - immune to concurrent cache flush
        return data;
    },

    /**
     * Returns entitlement_check_override flag of input app_id
     * check if the app is overriden through central_entitlement_check_override in CI
     * entitlement_check_override flag is set to true for all overriden apps
     * for other special apps this flag will be false
     */
    hasEntitlementCheckOverridenForApp: function(appId) {
        let uaAppInfo = this.getUAAppInfo();

        //If cache is empty, it will be reloaded in next Licensing engine job run
        if (gs.nil(uaAppInfo) || uaAppInfo.size === 0) {
            return false;
        }
        const uaAppInfoObjSet = uaAppInfo.get(appId);
        let entitlementCheckOverride = "";
        if (!gs.nil(uaAppInfoObjSet)) {
            for (const uaAppInfoObj of uaAppInfoObjSet) {
                if (!global.LicensingScriptUtil.nil(uaAppInfoObj[LicensingEngineDBConstants.ENTITLEMENT_CHECK_OVERRIDE])) {
                    entitlementCheckOverride = uaAppInfoObj[LicensingEngineDBConstants.ENTITLEMENT_CHECK_OVERRIDE];
                    return entitlementCheckOverride == '1';
                }
            }
        }
        return false;
    },


    /**
     * Returns if provide app_id installation is allowed on subprod instance
     * Since we are only storing the special app on this ua_app_info table
     * all the records in this table will have allow_on_customer_subprod = false
     * if the app is found in the cache/table means its special apps and not allowed on subprod
     */
    isCustomerAllowedToInstallOnSubprod: function(appId) {
        let uaAppInfo = this.getUAAppInfo();
        //If cache is empty, it will be reloaded in next Licensing engine job run
        if (gs.nil(uaAppInfo) || uaAppInfo.size === 0) {
            return true;
        }
        const uaAppInfoObjSet = uaAppInfo.get(appId);
        if (!gs.nil(uaAppInfoObjSet)) {
            return false;
        }
        return true;
    },

    /**
	 * The API return the list of special only
	 * The entitlement_check_override flag varies based on override status of the app
	 * For over-riden apps : "entitlement_check_override": "1"
	 * For other special apps : "entitlement_check_override": "0"
	 * API response format :
	 *"specialAppsList": [
      {
        "app_id": "com.sn_ex_sp_pro_plus",
        "entitlement_check_override": "0"
      },
      {
        "app_id": "com.test.app.v2",
        "entitlement_check_override": "1"
      }
	 *
	 * We populate the 'app_id' and "entitlement_check_override" based on the API reponse.
	 * Since the API only return the special apps by default "allow_on_customer_subprod" flag will be set as false for all records
	 * sample record in ua_app_info table for the above response
	 * app_id 					allow_on_customer_subprod			entitlement_check_override
	 * com.sn_ex_sp_pro_plus	false								false
	 * com.test.app.v2			false								true
	 */
    insertOrUpdateUAAppData: function(specialAppsList) {
        try {
            if (global.LicensingScriptUtil.nil(specialAppsList))
                return;

            var incomingAppIdsList = [];

            for (var i = 0; i < specialAppsList.length; i++) {
                var rec = specialAppsList[i];
                var appId = rec[LicensingEngineDBConstants.APP_ID];
                var entitlementCheckOverride = rec[LicensingEngineDBConstants.ENTITLEMENT_CHECK_OVERRIDE];

                if (global.LicensingScriptUtil.nil(appId))
                    continue;
                incomingAppIdsList.push(appId);

                var gr = new GlideRecord(LicensingEngineDBConstants.UA_APP_INFO);
                gr.addQuery(LicensingEngineDBConstants.APP_ID, appId);
                gr.query();
                // If the app_is not found in the table means its a new app, hence insert new record
                // If special app was overriden earlier but removed later, then the entitlement_check_override will change to false
                // We need to update those special apps
                if (gr.next()) {
                    if (gr.getValue(LicensingEngineDBConstants.ENTITLEMENT_CHECK_OVERRIDE) != entitlementCheckOverride) {
                        gr.setValue(LicensingEngineDBConstants.ENTITLEMENT_CHECK_OVERRIDE, entitlementCheckOverride);
                        gr.update();
                    }
                } else {
                    gr = new GlideRecord(LicensingEngineDBConstants.UA_APP_INFO);
                    gr.initialize();
                    gr.setValue(LicensingEngineDBConstants.APP_ID, appId);
                    gr.setValue(LicensingEngineDBConstants.ALLOW_ON_CUSTOMER_SUBPROD, false);
                    gr.setValue(LicensingEngineDBConstants.ENTITLEMENT_CHECK_OVERRIDE, entitlementCheckOverride);
                    gr.insert();
                }
            }

            // Cleanup stale data present in ua_app_info
            if (specialAppsList.length > 0) {
                var delGR = new GlideRecord(LicensingEngineDBConstants.UA_APP_INFO);
                delGR.addQuery(LicensingEngineDBConstants.APP_ID, LicensingEngineDBConstants.NOT_IN, incomingAppIdsList);
                delGR.query();
                delGR.deleteMultiple();
            }
        } catch (e) {
            this.logger.logError("UAAppInfoDAO", "insertOrUpdateUAAppData", 'UAAppInfoDAO failed to insert/update/cleanup uaAppData: ' + e);
        }
    },

    type: 'UAAppInfoDAO'
};
