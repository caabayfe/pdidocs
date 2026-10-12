var LicenseFamilyDao = Class.create();
LicenseFamilyDao.prototype = {
    initialize: function() {
        this.logger = new LoggingUtil();
        this._grHelper = new sn_entitlement.LicensingEngineGlideRecordHelper();
        this.cacheManager = new LicensingCacheManager();
        this.cacheDataHandler = new CacheDataHandler();
        this.cacheColumnList = [
            LicensingEngineDBConstants.SYS_ID
        ];
        this.cacheRefColumnList = [];
    },

    /**
     * Retrieves the license family ids (license_family.sys_id) values associated with a subscription
     *
     * @param {guid} subscriptionId The subscription_entitlement.sys_id value to filter family ids by
     * @returns {array} An array of license_family.sys_id values
     */
    getLicenseFamilyIdsBySubscriptionId: function(subscriptionId) {
        const gr = new GlideRecord('subscription_has_family');
        gr.addQuery('subscription.sys_id', subscriptionId);

        this._grHelper.addExtraField(gr, "subscription_family.sys_id");

        gr.query();

        let ids = [];
        while (gr.next())
            ids.push(String(gr.subscription_family.sys_id)); // reference key is 'family_id', therefore, add dot-walk for sys_id
        return ids;
    },

    loadAllDataIntoCache: function() {
        this.loadLicenseFamilyDataIntoCache();
    },

    /**
     * Queries license_family table and loads the required data into cache 
     *
     * Each record of license_family will be put in to cache as below
     * [family_id:[licFamilyObjMap1,licFamilyObjMap2..]]
     * licFamilyObjMap1 structure would be {sys_id:String}
     */
    loadLicenseFamilyDataIntoCache: function() {
        let licFamilyObjMap = this._loadLicenseFamilyData();
        this.cacheManager.putDataIntoCache(LicensingEngineConstants.LICENSING_CACHE_CATALOG, LicensingEngineConstants.LICENSE_FAMILY_CACHE, licFamilyObjMap);
    },

    /**
     * Internal method to load license family data from database
     * @returns {Map} Map of family_id to license family objects
     */
    _loadLicenseFamilyData: function() {
        let licFamilyObjMap = new Map();
        var licFamGR = new GlideRecord(LicensingEngineDBConstants.TABLE_LICENSE_FAMILY);
        if (licFamGR.isValid() && licFamGR.isValidField(LicensingEngineDBConstants.FAMILY_ID) &&
            licFamGR.isValidField(LicensingEngineDBConstants.SYS_ID)) {
            licFamGR.query();
            licFamilyObjMap = this.cacheDataHandler.prepareCacheData(licFamGR, licFamilyObjMap, LicensingEngineDBConstants.FAMILY_ID, this.cacheColumnList, this.cacheRefColumnList);
        }
        return licFamilyObjMap;
    },

    /**
     * Returns the map of family_id to license_family object
     * Map([license_family.family_id, [{sys_id = license_family.sys_id}]])
     * 
     * Each entry of the map would follow below structure:
     * [family_id:[licFamilyObjMap1,licFamilyObjMap2..]]
     * licFamilyObjMap1 structure would be {sys_id:String}
     * 
     * Uses local copy pattern to prevent race condition:
     * - Loads data into local variable (not re-fetched from cache)
     * - Returns local copy even if cache is flushed concurrently
     * - Other threads reload on cache miss (self-healing)
     * 
     * @returns {Map} Map of family IDs to license family objects
     */
    getLicenseFamilyInfo: function() {
        var data = this.cacheManager.getDataFromCache(LicensingEngineConstants.LICENSING_CACHE_CATALOG, LicensingEngineConstants.LICENSE_FAMILY_CACHE);
        if (gs.nil(data)) {
            // Load data locally
            data = this._loadLicenseFamilyData();
            // Cache for other threads
            this.cacheManager.putDataIntoCache(LicensingEngineConstants.LICENSING_CACHE_CATALOG, LicensingEngineConstants.LICENSE_FAMILY_CACHE, data);
        }
        // Return local variable for cache miss - immune to concurrent cache flush
        return data;
    },

    /**
     * Returns sys_id of input app family
     */
    getFamilySysId: function(familyId) {
        let licenseFamInfo = this.getLicenseFamilyInfo();

        //If cache is empty, it will be reloaded in next Licensing engine job run
        if (gs.nil(licenseFamInfo) || licenseFamInfo.size === 0) {
            return "";
        }
        const licFamObjectSet = licenseFamInfo.get(familyId);
        let famSysId = "";
        if (!gs.nil(licFamObjectSet)) {
            for (const licFamObject of licFamObjectSet) {
                if (!global.LicensingScriptUtil.nil(licFamObject[LicensingEngineDBConstants.SYS_ID])) {
                    famSysId = licFamObject[LicensingEngineDBConstants.SYS_ID];
                    return famSysId;
                }
            }
        }
        if (gs.nil(famSysId) && this.logger.isEntitlementLoggingEnabled()) {
            var conditionsString = LicensingEngineDBConstants.FAMILY_ID.concat(LicensingEngineConstants.COMMA).concat(familyId);
            this.logger.logRecordDoesNotExists(LicensingEngineConstants.LICENSE_FAMILY_DAO, LicensingEngineDBConstants.TABLE_LICENSE_FAMILY, conditionsString);
        }
        return famSysId;
    },

    type: 'LicenseFamilyDao'
};
