var SubscriptionEntitlementDAO = Class.create();
SubscriptionEntitlementDAO.prototype = {
    initialize: function() {
        this.logger = new LoggingUtil();
        this._cacheManager = new LicensingCacheManager();
        this._cacheDataHandler = new CacheDataHandler();

        // Contains the list of columns that are part of SKUMetadata cache object.
        this._cacheColumnList = [
            LicensingEngineDBConstants.NAME,
            LicensingEngineDBConstants.FGE_IDS,
            LicensingEngineDBConstants.SYS_ID,
            LicensingEngineDBConstants.START_DATE,
            LicensingEngineDBConstants.END_DATE,
            LicensingEngineDBConstants.DEFINITION_ID,
            LicensingEngineDBConstants.SUBSCRIPTION_IDENTIFIER,
            LicensingEngineDBConstants.PURCHASED_COUNT,
            LicensingEngineDBConstants.SUBSCRIPTION_TYPE,
            LicensingEngineDBConstants.MEASURED_ROLE_TYPES,
            LicensingEngineDBConstants.PRODUCT_CODE,
            LicensingEngineDBConstants.UNIT_OF_METER,
            LicensingEngineDBConstants.PARENT_ENTITLEMENT_ID,
            LicensingEngineDBConstants.ENTITLEMENT_ID,
            LicensingEngineDBConstants.PACKAGE,
            LicensingEngineDBConstants.ACCELERATOR_SUB_CATALOGS,
            LicensingEngineDBConstants.ENTITLEMENT_MODEL,
            LicensingEngineDBConstants.PRODUCT_ACCESS_LEVEL,
            LicensingEngineDBConstants.ENTITLEMENT_TYPE,
            LicensingEngineDBConstants.METER_TYPE,
            LicensingEngineDBConstants.DISPLAY_TYPE,
            LicensingEngineDBConstants.STATUS,
            LicensingEngineDBConstants.PROPOSED_FIX,
            LicensingEngineDBConstants.PROGRAM_TYPE,
            LicensingEngineDBConstants.PRODUCT_FAMILY_3
        ];
        this._cacheRefColumnList = [];
    },

    loadSubscriptionEntitlementIntoCache: function() {
        let entitlementIdToSubscriptionObj = this._loadSubscriptionEntitlementData();
        this._cacheManager.putDataIntoCache(LicensingEngineConstants.LICENSING_CACHE_CATALOG, LicensingEngineConstants.SUBSCRIPTION_ENTITLEMENT_CACHE, entitlementIdToSubscriptionObj);
    },

    /**
     * Internal method to load subscription entitlement data from database
     * @returns {Map} Map of entitlement_id to subscription entitlement objects
     */
    _loadSubscriptionEntitlementData: function() {
        let entitlementIdToSubscriptionObj = new Map();
        const gr = new GlideRecord(LicensingEngineDBConstants.SUBSCRIPTION_ENTITLEMENT);
        gr.addQuery(LicensingEngineDBConstants.STATUS, LicensingEngineDBConstants.IN, LicensingEngineDBConstants.DEFAULT_STATUS_TO_CHECK);
        gr.query();
        entitlementIdToSubscriptionObj = this._cacheDataHandler.prepareCacheData(gr, entitlementIdToSubscriptionObj, LicensingEngineDBConstants.ENTITLEMENT_ID, this._cacheColumnList, this._cacheRefColumnList);
        return entitlementIdToSubscriptionObj;
    },

    // Serialize when a single record contains multiple entitlement IDs.
    serializeId: function(attrList, fGEIds) {
        if (gs.nil(attrList))
            return fGEIds;

        if (attrList.indexOf(LicensingEngineConstants.COMMA) < 0) {
            fGEIds.push(attrList);
            return fGEIds;
        }

        var idList = attrList.split(LicensingEngineConstants.COMMA);
        idList.forEach(function(id) {
            fGEIds.push(id.trim());
        });
        return fGEIds;
    },

    // returns an array of subscription types associated with the given entitlement identifiers
    getSubscriptionTypesByEntIds: function(entitlementIds) {
        var subTypes = [];
        var entleGr = new GlideRecord(LicensingEngineDBConstants.SUBSCRIPTION_ENTITLEMENT);
        entleGr.addQuery(LicensingEngineDBConstants.ENTITLEMENT_ID, LicensingEngineDBConstants.IN, entitlementIds);
        entleGr.query();
        while (entleGr.next())
            subTypes.push(entleGr.getValue(LicensingEngineDBConstants.SUBSCRIPTION_TYPE));
        return subTypes;
    },

    // returns subscription type associated with the given subscripiton sys_id
    getSubscriptionTypeBySysId: function(subsSysId) {
        var entleGr = new GlideRecord(LicensingEngineDBConstants.SUBSCRIPTION_ENTITLEMENT);
        if (entleGr.get(subsSysId))
            return entleGr.getValue(LicensingEngineDBConstants.SUBSCRIPTION_TYPE);
        return null;
    },

    // returns subscription entitlement id associated with the given subscripiton sys_id
    getEntitlementIdBySysId: function(subsSysId) {
        var entleGr = new GlideRecord(LicensingEngineDBConstants.SUBSCRIPTION_ENTITLEMENT);
        if (entleGr.get(subsSysId))
            return entleGr.getValue(LicensingEngineDBConstants.ENTITLEMENT_ID);
        return null;
    },

    // returns an array of measured role types associated with the given entitlement identifier
    getMeasuredRoleTypesByEntId: function(entId) {
        var result = [];
        var entleGr = new GlideRecord(LicensingEngineDBConstants.SUBSCRIPTION_ENTITLEMENT);
        entleGr.addQuery(LicensingEngineDBConstants.ENTITLEMENT_ID, entId);
        entleGr.query();
        if (entleGr.next()) {
            var roleTypesString = entleGr.getValue(LicensingEngineDBConstants.MEASURED_ROLE_TYPES);
            if (!gs.nil(roleTypesString))
                result = this.getArrayByListString(roleTypesString);
        }
        return result;
    },

    // returns an array of measured role types associated with the given subscription sys_id
    getMeasuredRoleTypesBySysId: function(sysId) {
        var result = [];
        var entleGr = new GlideRecord(LicensingEngineDBConstants.SUBSCRIPTION_ENTITLEMENT);
        entleGr.addQuery(LicensingEngineDBConstants.SYS_ID, sysId);
        entleGr.query();
        if (entleGr.next()) {
            var roleTypesString = entleGr.getValue(LicensingEngineDBConstants.MEASURED_ROLE_TYPES);
            if (!gs.nil(roleTypesString))
                result = this.getArrayByListString(roleTypesString);
        }
        return result;
    },

    getArrayByListString: function(argString) {
        var result = [];
        if (argString.indexOf(LicensingEngineConstants.COMMA) > 0)
            return argString.split(LicensingEngineConstants.COMMA);
        result.push(argString);
        return result;
    },

    getProdInstNamesByEntitlementIds: function(entitlementIds) {
        var prodInstNames = [];
        try {
            var entitleGr = new GlideRecord(LicensingEngineDBConstants.SUBSCRIPTION_ENTITLEMENT);
            entitleGr.addQuery(LicensingEngineDBConstants.STATUS, LicensingEngineDBConstants.IN, LicensingEngineDBConstants.DEFAULT_STATUS_TO_CHECK);
            entitleGr.addQuery(LicensingEngineDBConstants.ENTITLEMENT_ID, LicensingEngineDBConstants.IN, entitlementIds);
            entitleGr.query();
            while (entitleGr.next())
                this.serializeProdInstNames(entitleGr.getValue(LicensingEngineDBConstants.PRODUCTION_INSTANCE_NAMES), prodInstNames);
        } catch (error) {
            this.logger.logErrorInDetermining(LicensingEngineConstants.SUBSCRIPTION_ENTITLEMENT_DAO, LicensingEngineConstants.GET_PROD_INSTANCE_NAMES, "error while loading ProdInstanceNames from DB", error);
        }
        return prodInstNames.length == 0 ? null : prodInstNames;
    },

    serializeProdInstNames: function(prodInstNamesFromDB, prodInstNames) {
        if (gs.nil(prodInstNamesFromDB))
            return prodInstNames;
        if (prodInstNamesFromDB.indexOf(LicensingEngineConstants.COMMA) < 0) {
            prodInstNames.push(prodInstNamesFromDB);
            return prodInstNames;
        }

        var prodInstNamesList = prodInstNamesFromDB.split(LicensingEngineConstants.COMMA);
        prodInstNamesList.forEach(function(id) {
            if (prodInstNames.indexOf(id.trim()) < 0)
                prodInstNames.push(id.trim());
        });
        return prodInstNames;
    },

    loadAllDataIntoCache: function() {
        this.loadSubscriptionEntitlementIntoCache();
    },

    /**
     * Returns the map of entitlement_id to subscription entitlement object
     * 
     * Uses local copy pattern to prevent race condition:
     * - Loads data into local variable (not re-fetched from cache)
     * - Returns local copy even if cache is flushed concurrently
     * - Other threads reload on cache miss (self-healing)
     * 
     * @returns {Map} Map of entitlement IDs to subscription objects
     */
    getSubscriptionEntitlements: function() {
        var data = this._cacheManager.getDataFromCache(LicensingEngineConstants.LICENSING_CACHE_CATALOG, LicensingEngineConstants.SUBSCRIPTION_ENTITLEMENT_CACHE);
        if (gs.nil(data)) {
            // Load data locally
            data = this._loadSubscriptionEntitlementData();
            // Cache for other threads
            this._cacheManager.putDataIntoCache(LicensingEngineConstants.LICENSING_CACHE_CATALOG, LicensingEngineConstants.SUBSCRIPTION_ENTITLEMENT_CACHE, data);
        }
        // Return local variable if cache doesn't exist - immune to concurrent cache flush
        return data;
    },

    _getResetSKUStartDate: function() {
        const gr = new GlideRecord(LicensingEngineDBConstants.SUBSCRIPTION_ENTITLEMENT);
        gr.addQuery(LicensingEngineDBConstants.METER_TYPE, LicensingEngineDBConstants.ASSIST_USAGE_RESET_SKU_METER_TYPE);
        gr.query();

        if (gr.next()) {
            return gr.getValue(LicensingEngineDBConstants.START_DATE);
        }

        return null;
    },

    type: 'SubscriptionEntitlementDAO'
};
