var UAAppFamilyDAO = Class.create();
UAAppFamilyDAO.prototype = {
    initialize: function() {
        this.logger = new LoggingUtil();
        this.cacheManager = new LicensingCacheManager();
        this.cacheDataHandler = new CacheDataHandler();
        this.cacheColumnList = [
            LicensingEngineDBConstants.LICENSE_CHECK_REQUIRED,
            LicensingEngineDBConstants.LINEAGE_ID
        ];
        this.cacheRefColumnList = [];
    },

    isLicenseCheckRequiredForApp: function(appId) {
        const appFamilyInfo = this.getAppInfo();
        if (!gs.nil(appFamilyInfo) && appFamilyInfo.size != 0) {
            const appInfoObjectSet = this._getAppInfoEntry(appFamilyInfo, appId);
            if (!gs.nil(appInfoObjectSet)) {
                for (const appInfoObject of appInfoObjectSet) {
                    if (!gs.nil(appInfoObject[LicensingEngineDBConstants.LICENSE_CHECK_REQUIRED])) {
                        return appInfoObject[LicensingEngineDBConstants.LICENSE_CHECK_REQUIRED];
                    }
                }
            } else if (this.logger.isEntitlementLoggingEnabled()) {
                const conditionsString = LicensingEngineDBConstants.APP_ID.concat(LicensingEngineConstants.COMMA).concat(appId);
                this.logger.logRecordDoesNotExists(LicensingEngineConstants.UA_APP_FAMILY_DAO, LicensingEngineDBConstants.UA_APP_FAMILY, conditionsString);
            }
        }

        if (this.logger.isEntitlementLoggingEnabled()) {
            this.logger.logCouldNotDetermine(LicensingEngineConstants.UA_APP_FAMILY_DAO, LicensingEngineConstants.IS_LICENSE_CHECK_REQUIRED_FOR_APP,
                LicensingEngineConstants.LICENSE_CHECK_REQUIRED_ATTRIBUTE + " appId : " + appId);
        }
        return null;
    },

    isLicenseCheckRequiredForFamily: function(familyId) {
        var appFamGR = new GlideRecord(LicensingEngineDBConstants.UA_APP_FAMILY);
        if (appFamGR.isValid() && appFamGR.isValidField(LicensingEngineDBConstants.LICENSE_CHECK_REQUIRED) &&
            appFamGR.isValidField(LicensingEngineDBConstants.LINEAGE_ID)) {
            appFamGR.addQuery(LicensingEngineDBConstants.LINEAGE_ID, familyId);
            appFamGR.query();
            var found = false;
            while (appFamGR.next()) {
                found = true;
                var licenseCheckRequired = appFamGR.getValue(LicensingEngineDBConstants.LICENSE_CHECK_REQUIRED);
                if (LicensingEngineConstants.TRUE_ONE.equals(licenseCheckRequired) || LicensingEngineConstants.TRUE.equals(licenseCheckRequired)) {
                    return true;
                }
            }
            if (!found) {
                if (this.logger.isEntitlementLoggingEnabled()) {
                    var conditionsString = LicensingEngineDBConstants.LINEAGE_ID.concat(LicensingEngineConstants.COMMA).concat(familyId);
                    this.logger.logRecordDoesNotExists(LicensingEngineConstants.UA_APP_FAMILY_DAO, LicensingEngineDBConstants.UA_APP_FAMILY, conditionsString);
                }
            }
            return false;
        }
        if (this.logger.isEntitlementLoggingEnabled()) {
            this.logger.logCouldNotDetermine(LicensingEngineConstants.UA_APP_FAMILY_DAO, LicensingEngineConstants.IS_LICENSE_CHECK_REQUIRED_FOR_FAMILY,
                LicensingEngineConstants.LICENSE_CHECK_REQUIRED_ATTRIBUTE + " familyId : " + familyId);
        }
        return false;
    },

    doesAppExist: function(appId) {
        const appInfo = this.getAppInfo();
        if (gs.nil(appInfo) || appInfo.size == 0)
            return false;
        return !gs.nil(this._getAppInfoEntry(appInfo, appId));
    },

    doesFamExists: function(familyId) {
        var appFamGR = new GlideRecord(LicensingEngineDBConstants.UA_APP_FAMILY);
        if (appFamGR.isValid()) {
            appFamGR.addQuery(LicensingEngineDBConstants.LINEAGE_ID, familyId);
            appFamGR.query();
            return appFamGR.hasNext();
        }
        return false;
    },

    getAppToEntitlmentMap: function(appIdList, appEntitlementBOMap, appSubscriptionMap) {
        let licenseCheckAttr;
        let isLicenseCheckRequired = true;
        let entitlementBO = {};
        let ua_app_family_ids = [];
        try {
            let appFamGR = new GlideRecord(LicensingEngineDBConstants.UA_APP_FAMILY);
            appFamGR.addQuery(LicensingEngineDBConstants.APP_ID, LicensingEngineDBConstants.IN, appIdList);
            appFamGR.query();
            while (appFamGR.next()) {
                const appId = appFamGR.getValue(LicensingEngineDBConstants.APP_ID);
                ua_app_family_ids.push(appId);
                entitlementBO = appEntitlementBOMap[appId];
                // If there is no subscription attached to the app but record exist in ua_app_familly .
                if (entitlementBO === undefined) {
                    entitlementBO = Object.create(LicensingEngineConstants.entitlementBO);
                    appEntitlementBOMap[appId] = entitlementBO;
                }
                licenseCheckAttr = appFamGR.getValue(LicensingEngineDBConstants.LICENSE_CHECK_REQUIRED);
                isLicenseCheckRequired = LicensingEngineConstants.TRUE_ONE.equals(licenseCheckAttr) || LicensingEngineConstants.TRUE.equals(licenseCheckAttr);

                const isEntitled = !isLicenseCheckRequired ? true : !gs.nil(appSubscriptionMap[appId]);
                entitlementBO['isEntitled'] = isEntitled;
                entitlementBO['isPermitted'] = !new InstanceInfoUtil().isOpenInstance() ? isEntitled : true;
            }
            for (var appId in appEntitlementBOMap) {
                const logger = new LoggingUtil();
                if (ua_app_family_ids.indexOf(appId) == -1) {
                    if (logger.isEntitlementLoggingEnabled()) {
                        var conditionsString = LicensingEngineDBConstants.APP_ID.concat(LicensingEngineConstants.COMMA).concat(appId);
                        logger.logRecordDoesNotExists(LicensingEngineConstants.UA_APP_FAMILY_DAO, LicensingEngineDBConstants.UA_APP_FAMILY, conditionsString);
                    }
                }
            }
        } catch (error) {
            this.logger.logError(LicensingEngineConstants.UA_APP_FAMILY_DAO, LicensingEngineConstants.GET_APP_ENTITLEMENT_MAP,
                error);
        }
        return appEntitlementBOMap;
    },

    getFamilyListOfApp: function(appId) {
        const familyIds = [];
        const appInfo = this.getAppInfo();
        if (!gs.nil(appInfo) && appInfo.size != 0) {
            const appInfoObjectSet = this._getAppInfoEntry(appInfo, appId);
            if (gs.nil(appInfoObjectSet))
                return familyIds;
            for (const appInfoObject of appInfoObjectSet) {
                if (!global.LicensingScriptUtil.nil(appInfoObject[LicensingEngineDBConstants.LINEAGE_ID])) {
                    familyIds.push(appInfoObject[LicensingEngineDBConstants.LINEAGE_ID]);
                }
            }
        }
        return familyIds;
    },

    loadAllDataIntoCache: function() {
        this.loadAppInfoDataIntoCache();
    },

    /**
     * Queries ua_app_family table and loads the required data into cache 
     * 
     * Each record of ua_app_family will be put in to cache as below
     * [app_id:[appFamObj1,appFamObj2..]]
     * appFamObj structure would be {license_check_required:true/false, lineage:family_id}
     * 
     */
    loadAppInfoDataIntoCache: function() {
        let appIdToAppFamilyObjMap = this._loadAppInfoData();
        this.cacheManager.putDataIntoCache(LicensingEngineConstants.LICENSING_CACHE_CATALOG, LicensingEngineConstants.APP_INFO_CACHE, appIdToAppFamilyObjMap);
    },

    /**
     * Internal method to load app info data from database
     * @returns {Map} Map of app_id to app family objects
     */
    _loadAppInfoData: function() {
        let appIdToAppFamilyObjMap = new Map();
        var appFamGR = new GlideRecord(LicensingEngineDBConstants.UA_APP_FAMILY);
        if (appFamGR.isValid() && appFamGR.isValidField(LicensingEngineDBConstants.LICENSE_CHECK_REQUIRED) &&
            appFamGR.isValidField(LicensingEngineConstants.APP_ID)) {
            appFamGR.query();
            appIdToAppFamilyObjMap = this.cacheDataHandler.prepareCacheData(appFamGR, appIdToAppFamilyObjMap, LicensingEngineDBConstants.APP_ID, this.cacheColumnList, this.cacheRefColumnList);
        }
        return appIdToAppFamilyObjMap;
    },

    /**
     * Looks up appId in the cache map, tolerating a casing mismatch between the caller's appId
     * and how it's stored in ua_app_family (DEF0896792). Tries the exact value first (cheapest,
     * and correct for the common case where casing already matches), then lower/upper case.
     */
    _getAppInfoEntry: function(map, appId) {
        let entry = map.get(appId);
        if (!gs.nil(entry) || gs.nil(appId))
            return entry;
        entry = map.get(String(appId).toLowerCase());
        if (!gs.nil(entry))
            return entry;
        return map.get(String(appId).toUpperCase());
    },

    /**
     * Returns the map of app_id to cached column values of ua_app_family object
     * Map([ua_app_family.app_id, [{license_check_required = ua_app_family.license_check_required,lineage =ua_app_family.lineage}]])
     * 
     * Each entry of the map would follow below structure:
     * [app_id,[appFamObj1,appFamObj2..]]
     * appFamObj structure would be {license_check_required:true/false, lineage:family_id}
     * 
     * Uses local copy pattern to prevent race condition:
     * - Loads data into local variable (not re-fetched from cache)
     * - Returns local copy even if cache is flushed concurrently
     * - Other threads reload on cache miss (self-healing)
     * 
     * @returns {Map} Map of app IDs to app family objects
     */
    getAppInfo: function() {
        var data = this.cacheManager.getDataFromCache(LicensingEngineConstants.LICENSING_CACHE_CATALOG, LicensingEngineConstants.APP_INFO_CACHE);
        if (gs.nil(data)) {
            // Load data locally
            data = this._loadAppInfoData();
            // Cache for other threads
            this.cacheManager.putDataIntoCache(LicensingEngineConstants.LICENSING_CACHE_CATALOG, LicensingEngineConstants.APP_INFO_CACHE, data);
        }
        // Return local variable if cache doesn't exist - immune to concurrent cache flush
        return data;
    },

    type: 'UAAppFamilyDAO'
};
