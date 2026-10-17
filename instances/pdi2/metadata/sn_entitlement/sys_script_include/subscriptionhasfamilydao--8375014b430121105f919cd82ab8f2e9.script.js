var SubscriptionHasFamilyDAO = Class.create();
SubscriptionHasFamilyDAO.prototype = {
    initialize: function() {
        this.logger = new LoggingUtil();
        this.cacheManager = new LicensingCacheManager();
        this.cacheDataHandler = new CacheDataHandler();
        this.cacheColumnList = [
            LicensingEngineDBConstants.INSTALLABLE
        ];
        this.cacheRefColumnList = [];
        this._grHelper = new sn_entitlement.LicensingEngineGlideRecordHelper();

    },

    getActiveSubscriptionsForFamily: function(familyId) {
        var activeSubscriptions = [];
        var familySubscriptionGR = new GlideRecord(LicensingEngineDBConstants.SUBSCRIPTION_HAS_FAMILY);
        if (familySubscriptionGR.isValid() && familySubscriptionGR.isValidField(LicensingEngineDBConstants.SUBSCRIPTION) &&
            familySubscriptionGR.isValidField(LicensingEngineDBConstants.LICENSE_FAMILY)) {
            familySubscriptionGR.addQuery(LicensingEngineDBConstants.LICENSE_FAMILY, familyId);
            var subscriptionStatusField = LicensingEngineDBConstants.SUBSCRIPTION.concat(LicensingEngineConstants.DOT).concat(LicensingEngineDBConstants.STATUS);
            familySubscriptionGR.addQuery(subscriptionStatusField, LicensingEngineDBConstants.IN, LicensingEngineDBConstants.DEFAULT_STATUS_TO_CHECK);
            familySubscriptionGR.query();
            while (familySubscriptionGR.next())
                activeSubscriptions.push(familySubscriptionGR.getValue(LicensingEngineDBConstants.SUBSCRIPTION));
            if (activeSubscriptions.length === 0) {
                if (this.logger.isEntitlementLoggingEnabled()) {
                    var conditionsString = LicensingEngineDBConstants.LICENSE_FAMILY.concat(LicensingEngineConstants.COMMA).concat(familyId).concat(LicensingEngineConstants.COMMA)
                        .concat(subscriptionStatusField).concat(LicensingEngineConstants.COMMA).concat(LicensingEngineDBConstants.DEFAULT_STATUS_TO_CHECK.join());
                    this.logger.logRecordDoesNotExists(LicensingEngineConstants.SUBSCRIPTION_HAS_FAMILY_DAO, LicensingEngineDBConstants.SUBSCRIPTION_HAS_FAMILY, conditionsString);
                }
            }
        }
        return activeSubscriptions;
    },

    getPaidStoreAppSubscriptionsByFamilies: function(familyIds) {
        var paidStoreAppFamilies = [];
        var familySubscriptionGR = new GlideRecord(LicensingEngineDBConstants.SUBSCRIPTION_HAS_FAMILY);
        if (familySubscriptionGR.isValid() && familySubscriptionGR.isValidField(LicensingEngineDBConstants.SUBSCRIPTION) &&
            familySubscriptionGR.isValidField(LicensingEngineDBConstants.LICENSE_FAMILY)) {

            familySubscriptionGR.addQuery(LicensingEngineDBConstants.LICENSE_FAMILY, familyIds);

            var subscriptionStatus = LicensingEngineDBConstants.SUBSCRIPTION.concat(LicensingEngineConstants.DOT).concat(LicensingEngineDBConstants.STATUS);
            familySubscriptionGR.addQuery(subscriptionStatus, LicensingEngineDBConstants.IN, LicensingEngineDBConstants.DEFAULT_STATUS_TO_CHECK);

            var subscriptionCategory = LicensingEngineDBConstants.SUBSCRIPTION.concat(LicensingEngineConstants.DOT).concat(LicensingEngineDBConstants.CATEGORY);
            familySubscriptionGR.addQuery(subscriptionCategory, LicensingEngineDBConstants.CATEGORY_VALUE.STORE_APPLICATION);

            var subscriptionForFee = LicensingEngineDBConstants.SUBSCRIPTION.concat(LicensingEngineConstants.DOT).concat(LicensingEngineDBConstants.FOR_FEE);
            familySubscriptionGR.addQuery(subscriptionForFee, true);

            familySubscriptionGR.query();
            while (familySubscriptionGR.next())
                paidStoreAppFamilies.push(familySubscriptionGR.getValue(LicensingEngineDBConstants.LICENSE_FAMILY));
        }
        return paidStoreAppFamilies;
    },

    getSubscriptionIdByIsAppEngineV2: function() {
        const FAMILY_ID = LicensingEngineDBConstants.SUBSCRIPTION_FAMILY.concat(LicensingEngineConstants.DOT).concat(LicensingEngineDBConstants.FAMILY_ID);
        const SUBSCRIPTION_STATUS = LicensingEngineDBConstants.SUBSCRIPTION.concat(LicensingEngineConstants.DOT).concat(LicensingEngineDBConstants.STATUS);

        const familySubscriptionGR = new GlideRecord(LicensingEngineDBConstants.SUBSCRIPTION_HAS_FAMILY);
        familySubscriptionGR.addQuery(FAMILY_ID, 'CONTAINS', 'app_engine_v2');
        familySubscriptionGR.addQuery(SUBSCRIPTION_STATUS, LicensingEngineDBConstants.IN, LicensingEngineDBConstants.DEFAULT_STATUS_TO_CHECK);
        familySubscriptionGR.query();
        return familySubscriptionGR.next() ? familySubscriptionGR.subscription.sys_id : '';
    },


    getActiveSubscriptionSysIdsForFamily: function(familyId) {
        var activeSubscriptions = [];
        var familySubscriptionGR = new GlideRecord(LicensingEngineDBConstants.SUBSCRIPTION_HAS_FAMILY);

        if (familySubscriptionGR.isValid() && familySubscriptionGR.isValidField(LicensingEngineDBConstants.SUBSCRIPTION) &&
            familySubscriptionGR.isValidField(LicensingEngineDBConstants.LICENSE_FAMILY)) {
            familySubscriptionGR.addQuery(LicensingEngineDBConstants.LICENSE_FAMILY, familyId);

            var subscriptionStatusField = LicensingEngineDBConstants.SUBSCRIPTION.concat(LicensingEngineConstants.DOT).concat(LicensingEngineDBConstants.STATUS);
            familySubscriptionGR.addQuery(subscriptionStatusField, LicensingEngineDBConstants.IN, LicensingEngineDBConstants.DEFAULT_STATUS_TO_CHECK);
            familySubscriptionGR.query();

            while (familySubscriptionGR.next())
                activeSubscriptions.push(familySubscriptionGR.getElement(LicensingEngineDBConstants.SUBSCRIPTION_SYS_ID));

            if (activeSubscriptions.length === 0 && this.logger.isEntitlementLoggingEnabled()) {
                var conditionsString = LicensingEngineDBConstants.LICENSE_FAMILY.concat(LicensingEngineConstants.COMMA).concat(familyId).concat(LicensingEngineConstants.COMMA)
                    .concat(subscriptionStatusField).concat(LicensingEngineConstants.COMMA).concat(LicensingEngineDBConstants.DEFAULT_STATUS_TO_CHECK.join());
                this.logger.logRecordDoesNotExists(LicensingEngineConstants.SUBSCRIPTION_HAS_FAMILY_DAO, LicensingEngineDBConstants.SUBSCRIPTION_HAS_FAMILY, conditionsString);
            }
        }
        return activeSubscriptions;
    },

    /**
     * Returns true if family is installable through atleast one subscription.
     */
    getLicensableStateForFamily: function(familyIds) {
        let isInstallable = true;
        if (global.LicensingScriptUtil.nil(familyIds))
            return isInstallable;

        const subscriptionFamInfo = this.getSubscriptionFamilyInfo();
        //subscriptionFamInfo: map of (familyID:[{subscriptionFamObj1,subscriptionFamObj2..}])
        if (!global.LicensingScriptUtil.nil(subscriptionFamInfo)) {
            for (const familyId of familyIds) {
                const subsHasFamObjectSet = subscriptionFamInfo.get(familyId);
                if (gs.nil(subsHasFamObjectSet))
                    continue;
                for (const subsHasFamObject of subsHasFamObjectSet) {
                    if (!global.LicensingScriptUtil.nil(subsHasFamObject[LicensingEngineDBConstants.INSTALLABLE])) {
                        isInstallable = subsHasFamObject[LicensingEngineDBConstants.INSTALLABLE] == 0 ? false : true;
                        if (isInstallable)
                            return true;
                    }
                }
            }
        }
        return isInstallable;
    },

    loadAllDataIntoCache: function() {
        this.loadSubscriptionFamilyDataIntoCache();
    },

    /**
     * Queries subscription_has_family table and loads the required data into cache 
     *
     * Each record of subscription_has_family will be put in to cache as below
     * [family_id:[subscriptionFamObj1,subscriptionFamObj2..]]
     * subscriptionFamObj1 structure would be {installable:true/false}
     */
    loadSubscriptionFamilyDataIntoCache: function() {
        let famIdToSubHasFamilyObjMap = this._loadSubscriptionFamilyData();
        this.cacheManager.putDataIntoCache(LicensingEngineConstants.LICENSING_CACHE_CATALOG, LicensingEngineConstants.SUBSCRIPTION_FAMILY_CACHE, famIdToSubHasFamilyObjMap);
    },

    /**
     * Internal method to load subscription family data from database
     * @returns {Map} Map of family_id to subscription family objects
     */
    _loadSubscriptionFamilyData: function() {
        let famIdToSubHasFamilyObjMap = new Map();
        var subHasFamGR = new GlideRecord(LicensingEngineDBConstants.SUBSCRIPTION_HAS_FAMILY);
        if (subHasFamGR.isValid() && subHasFamGR.isValidField(LicensingEngineDBConstants.LICENSE_FAMILY) &&
            subHasFamGR.isValidField(LicensingEngineDBConstants.INSTALLABLE)) {
            subHasFamGR.query();
            famIdToSubHasFamilyObjMap = this.cacheDataHandler.prepareCacheData(subHasFamGR, famIdToSubHasFamilyObjMap, LicensingEngineDBConstants.LICENSE_FAMILY, this.cacheColumnList, this.cacheRefColumnList);
        }
        return famIdToSubHasFamilyObjMap;
    },

    /**
     * Returns the map of fam_id to subscription_has_family object
     * Map([subscription_has_family.license_family, [{installable = subscription_has_family.installable}]])
     * 
     * Each entry of the map would follow below structure:
     * [family_id:[subscriptionFamObj1,subscriptionFamObj2..]]
     * subscriptionFamObj1 structure would be {installable:true/false}
     * 
     * Uses local copy pattern to prevent race condition:
     * - Loads data into local variable (not re-fetched from cache)
     * - Returns local copy even if cache is flushed concurrently
     * - Other threads reload on cache miss (self-healing)
     * 
     * @returns {Map} Map of family IDs to subscription family objects
     */
    getSubscriptionFamilyInfo: function() {
        var data = this.cacheManager.getDataFromCache(LicensingEngineConstants.LICENSING_CACHE_CATALOG, LicensingEngineConstants.SUBSCRIPTION_FAMILY_CACHE);
        if (gs.nil(data)) {
            // Load data locally
            data = this._loadSubscriptionFamilyData();
            // Cache for other threads
            this.cacheManager.putDataIntoCache(LicensingEngineConstants.LICENSING_CACHE_CATALOG, LicensingEngineConstants.SUBSCRIPTION_FAMILY_CACHE, data);
        }
        // Return local variable if cache doesn't exist - immune to concurrent cache flush
        return data;
    },

    /**
     * Returns array of  "custom table access" application family for a subscription.
     * Returns empty array if there are no "custom table access" application family for the subscription.
     */
    getCustomTableAccessApplicationFamilyForSubscription: function(
        subscriptionId
    ) {
        var subscriptionEntitlementDAO = new SubscriptionEntitlementDAO();
        var applicationFamilies = [];
        var entitlementId =
            subscriptionEntitlementDAO.getEntitlementIdBySysId(subscriptionId);

        if (!entitlementId) {
            return applicationFamilies;
        }
        var familySubscriptionGR = new GlideRecord(LicensingEngineDBConstants.SUBSCRIPTION_HAS_FAMILY);

        familySubscriptionGR.addQuery(LicensingEngineDBConstants.SUBSCRIPTION, entitlementId);

        familySubscriptionGR.addQuery(LicensingEngineDBConstants.LICENSE_FAMILY, "ENDSWITH", "custom_table_access");

        this._grHelper.addExtraField(familySubscriptionGR, "subscription_family.sys_id");
        this._grHelper.addExtraField(familySubscriptionGR, "subscription_family.family_id");
        this._grHelper.addExtraField(familySubscriptionGR, "subscription_family.family_name");

        familySubscriptionGR.query();

        while (familySubscriptionGR.next()) {

            applicationFamilies.push({
                appSysId: familySubscriptionGR.subscription_family.sys_id.toString(),
                appId: familySubscriptionGR.subscription_family.family_id.toString(),
                appName: familySubscriptionGR.subscription_family.family_name.toString()
            });

        }

        return applicationFamilies;
    },

    getSubscribedAppFamilies: function(appScopeIds) {
        var subscribedAppFamilies = [];
        if (gs.nil(appScopeIds))
            return subscribedAppFamilies;
        var encodedQuery = "subscription_family.family_idIN" + appScopeIds.join(",");
        var familySubscriptionGR = new GlideRecord(LicensingEngineDBConstants.SUBSCRIPTION_HAS_FAMILY);
        if (familySubscriptionGR.isValid() && familySubscriptionGR.isValidField(LicensingEngineDBConstants.SUBSCRIPTION) &&
            familySubscriptionGR.isValidField(LicensingEngineDBConstants.LICENSE_FAMILY)) {
            familySubscriptionGR.addEncodedQuery(encodedQuery);
            familySubscriptionGR.query();
            while (familySubscriptionGR.next())
                subscribedAppFamilies.push(familySubscriptionGR.getValue(LicensingEngineDBConstants.LICENSE_FAMILY));
        }
        return subscribedAppFamilies;
    },

    type: "SubscriptionHasFamilyDAO"
};
