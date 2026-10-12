var SubscriptionEntitlementItemDAO = Class.create();
SubscriptionEntitlementItemDAO.prototype = {
    initialize: function() {
        this.TABLE_NAME = LicensingEngineDBConstants.SUBSCRIPTION_ENTITLEMENT_ITEM;
        this._cacheManager = new LicensingCacheManager();
        this._cacheDataHandler = new CacheDataHandler();

        // Contains the list of columns that are part of subscription entitlement item cache object.
        this._cacheColumnList = [
            LicensingEngineDBConstants.NAME,
            LicensingEngineDBConstants.START_DATE,
            LicensingEngineDBConstants.END_DATE,
            LicensingEngineDBConstants.STATUS,
            LicensingEngineDBConstants.PURCHASED_COUNT,
            LicensingEngineDBConstants.PRODUCT_CODE,
            LicensingEngineDBConstants.DEFINITION_ID,
            LicensingEngineDBConstants.SUBSCRIPTION_TYPE,
            LicensingEngineDBConstants.ENTITLEMENT_TYPE,
            LicensingEngineDBConstants.UNIT_OF_METER,
            LicensingEngineDBConstants.PARENT_ENTITLEMENT_ID,
            LicensingEngineDBConstants.ENTITLEMENT_ID,
            LicensingEngineDBConstants.PACKAGE_TYPE,
            LicensingEngineDBConstants.SYS_ID
        ];
        this._cacheRefColumnList = [];

    },

    /**
     * Queries subscription_entitlement_item table for valid subscription entitlement items and prepares the cache with entitlement ID as
     * key and Subscription Entitlement Item object as value.
     */
    loadSubscriptionEntitlementItemIntoCache: function() {
        let entitlementIdToSubscriptionItemObj = this._loadSubscriptionEntitlementItemData();
        this._cacheManager.putDataIntoCache(LicensingEngineConstants.LICENSING_CACHE_CATALOG, LicensingEngineConstants.SUBSCRIPTION_ENTITLEMENT_ITEM_CACHE, entitlementIdToSubscriptionItemObj);
    },

    /**
     * Internal method to load subscription entitlement item data from database
     * @returns {Map} Map of entitlement_id to subscription entitlement item objects
     */
    _loadSubscriptionEntitlementItemData: function() {
        let entitlementIdToSubscriptionItemObj = new Map();
        const gr = new GlideRecord(this.TABLE_NAME);
        gr.addQuery(LicensingEngineDBConstants.STATUS, LicensingEngineDBConstants.IN, LicensingEngineDBConstants.DEFAULT_STATUS_TO_CHECK);
        gr.query();
        entitlementIdToSubscriptionItemObj = this._cacheDataHandler.prepareCacheData(gr, entitlementIdToSubscriptionItemObj, LicensingEngineDBConstants.ENTITLEMENT_ID, this._cacheColumnList, this._cacheRefColumnList);
        return entitlementIdToSubscriptionItemObj;
    },

    loadAllDataIntoCache: function() {
        this.loadSubscriptionEntitlementItemIntoCache();
    },

    /**
     * Returns the map of entitlement_id to subscription entitlement item object
     * 
     * Uses local copy pattern to prevent race condition:
     * - Loads data into local variable (not re-fetched from cache)
     * - Returns local copy even if cache is flushed concurrently
     * - Other threads reload on cache miss (self-healing)
     * 
     * @returns {Map} Map of entitlement IDs to subscription item objects
     */
    getSubscriptionEntitlementItems: function() {
        var data = this._cacheManager.getDataFromCache(LicensingEngineConstants.LICENSING_CACHE_CATALOG, LicensingEngineConstants.SUBSCRIPTION_ENTITLEMENT_ITEM_CACHE);
        if (gs.nil(data)) {
            // Load data locally
            data = this._loadSubscriptionEntitlementItemData();
            // Cache for other threads
            this._cacheManager.putDataIntoCache(LicensingEngineConstants.LICENSING_CACHE_CATALOG, LicensingEngineConstants.SUBSCRIPTION_ENTITLEMENT_ITEM_CACHE, data);
        }
        // Return local variable if cache doesn't exist - immune to concurrent cache flush
        return data;
    },

    type: 'SubscriptionEntitlementItemDAO'
};
