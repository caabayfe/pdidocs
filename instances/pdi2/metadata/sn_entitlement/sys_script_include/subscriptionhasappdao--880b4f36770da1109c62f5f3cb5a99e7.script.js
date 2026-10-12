var SubscriptionHasAppDAO = Class.create();
SubscriptionHasAppDAO.prototype = {
    initialize: function() {
        this.logger = new LoggingUtil();
        this.cacheManager = new LicensingCacheManager();
        this.cacheDataHandler = new CacheDataHandler();
    },

    getActiveSubscriptionsForApp: function(appId) {
        var activeAppSubscriptions = [];
        var appSubscriptionGR = new GlideRecord(LicensingEngineDBConstants.SUBSCRIPTION_HAS_APP);
        if (appSubscriptionGR.isValid() && appSubscriptionGR.isValidField(LicensingEngineDBConstants.SUBSCRIPTION) &&
            appSubscriptionGR.isValidField(LicensingEngineDBConstants.APPLICATION)) {
            var appIdField = LicensingEngineDBConstants.APPLICATION.concat(LicensingEngineConstants.DOT).concat(LicensingEngineDBConstants.APP_ID);
            appSubscriptionGR.addQuery(appIdField, appId);
            var subscriptionStatusField = LicensingEngineDBConstants.SUBSCRIPTION.concat(LicensingEngineConstants.DOT).concat(LicensingEngineDBConstants.STATUS);
            appSubscriptionGR.addQuery(subscriptionStatusField, LicensingEngineDBConstants.IN, LicensingEngineDBConstants.DEFAULT_STATUS_TO_CHECK);
            appSubscriptionGR.query();
            while (appSubscriptionGR.next())
                activeAppSubscriptions.push(appSubscriptionGR.getValue(LicensingEngineDBConstants.SUBSCRIPTION));
            if (activeAppSubscriptions.length === 0 && this.logger.isEntitlementLoggingEnabled()) {
                var conditionsString = LicensingEngineDBConstants.APPLICATION.concat(LicensingEngineConstants.COMMA).concat(appId).concat(LicensingEngineConstants.COMMA)
                    .concat(subscriptionStatusField).concat(LicensingEngineConstants.COMMA).concat(LicensingEngineDBConstants.DEFAULT_STATUS_TO_CHECK.join());
                this.logger.logRecordDoesNotExists(LicensingEngineConstants.SUBSCRIPTION_HAS_APP_DAO, LicensingEngineDBConstants.SUBSCRIPTION_HAS_APP, conditionsString);
            }
        }

        if (activeAppSubscriptions.length === 0 && this.logger.isEntitlementLoggingEnabled())
            this.logger.logCouldNotDetermine(LicensingEngineConstants.SUBSCRIPTION_HAS_APP_DAO, LicensingEngineConstants.GET_ACTIVE_SUBSCRIPTIONS_FOR_APP,
                LicensingEngineConstants.ACTIVE_ASSOCIATED_SUBSCRIPTIONS.concat(LicensingEngineConstants.COLON).concat(appId));

        return activeAppSubscriptions;
    },

    getActiveSubscriptionMapForApps: function(appIdList) {
        let appToSubscriptionMap = {};
        try {
            let subscriptionAppGR = new GlideRecord(LicensingEngineDBConstants.SUBSCRIPTION_HAS_APP);
            if (subscriptionAppGR.isValid() && subscriptionAppGR.isValidField(LicensingEngineDBConstants.SUBSCRIPTION) &&
                subscriptionAppGR.isValidField(LicensingEngineDBConstants.APPLICATION)) {
                const appIdField = LicensingEngineDBConstants.APPLICATION.concat(LicensingEngineConstants.DOT).concat(LicensingEngineDBConstants.APP_ID);

                subscriptionAppGR.addQuery(appIdField, LicensingEngineDBConstants.IN, appIdList);
                const subscriptionStatusField = LicensingEngineDBConstants.SUBSCRIPTION.concat(LicensingEngineConstants.DOT).concat(LicensingEngineDBConstants.STATUS);
                subscriptionAppGR.addQuery(subscriptionStatusField, LicensingEngineDBConstants.IN, LicensingEngineDBConstants.DEFAULT_STATUS_TO_CHECK);
                subscriptionAppGR.query();
                while (subscriptionAppGR.next()) {
                    let activeAppSubscriptions = [];
                    const appId = subscriptionAppGR.getElement(appIdField);

                    if (appToSubscriptionMap[appId] != undefined)
                        activeAppSubscriptions = appToSubscriptionMap[appId];

                    activeAppSubscriptions.push(subscriptionAppGR.getValue(LicensingEngineDBConstants.SUBSCRIPTION));
                    appToSubscriptionMap[appId] = activeAppSubscriptions;
                }

                const appIds = appIdList.split(LicensingEngineConstants.COMMA);
                // Identifies if the record doesn't exist for an app.
                appIds.forEach(function(appId) {
                    if (appToSubscriptionMap[appId] == undefined) {
                        appToSubscriptionMap[appId] = [];
                        const logger = new LoggingUtil();
                        if (logger.isEntitlementLoggingEnabled()) {
                            const conditionsString = LicensingEngineDBConstants.APPLICATION.concat(LicensingEngineConstants.COMMA).concat(appId);
                            logger.logRecordDoesNotExists(LicensingEngineConstants.SUBSCRIPTION_HAS_APP_DAO, LicensingEngineDBConstants.SUBSCRIPTION_HAS_APP, conditionsString);
                        }
                    }
                });
            }
        } catch (error) {
            this.logger.logError(LicensingEngineConstants.SUBSCRIPTION_HAS_APP_DAO, LicensingEngineConstants.GET_ACTIVE_SUBSCRIPTION_MAP,
                error);
        }
        return appToSubscriptionMap;
    },


    getActiveSubscriptionSysIdsForApp: function(appId) {
        let activeAppSubscriptions = [];
        const appSubscriptionGR = new GlideRecord(LicensingEngineDBConstants.SUBSCRIPTION_HAS_APP);
        if (appSubscriptionGR.isValid() && appSubscriptionGR.isValidField(LicensingEngineDBConstants.SUBSCRIPTION) &&
            appSubscriptionGR.isValidField(LicensingEngineDBConstants.APPLICATION)) {
            const appIdField = LicensingEngineDBConstants.APPLICATION.concat(LicensingEngineConstants.DOT).concat(LicensingEngineDBConstants.APP_ID);
            appSubscriptionGR.addQuery(appIdField, appId);
            const subscriptionStatusField = LicensingEngineDBConstants.SUBSCRIPTION.concat(LicensingEngineConstants.DOT).concat(LicensingEngineDBConstants.STATUS);
            appSubscriptionGR.addQuery(subscriptionStatusField, LicensingEngineDBConstants.IN, LicensingEngineDBConstants.DEFAULT_STATUS_TO_CHECK);
            appSubscriptionGR.query();

            while (appSubscriptionGR.next())
                activeAppSubscriptions.push(appSubscriptionGR.getElement(LicensingEngineDBConstants.SUBSCRIPTION_SYS_ID));
            if (activeAppSubscriptions.length === 0 && this.logger.isEntitlementLoggingEnabled()) {
                var conditionsString = LicensingEngineDBConstants.APPLICATION.concat(LicensingEngineConstants.COMMA).concat(appId).concat(LicensingEngineConstants.COMMA)
                    .concat(subscriptionStatusField).concat(LicensingEngineConstants.COMMA).concat(LicensingEngineDBConstants.DEFAULT_STATUS_TO_CHECK.join());
                this.logger.logRecordDoesNotExists(LicensingEngineConstants.SUBSCRIPTION_HAS_APP_DAO, LicensingEngineDBConstants.SUBSCRIPTION_HAS_APP, conditionsString);
            }
        }

        if (activeAppSubscriptions.length === 0 && this.logger.isEntitlementLoggingEnabled())
            this.logger.logCouldNotDetermine(LicensingEngineConstants.SUBSCRIPTION_HAS_APP_DAO, LicensingEngineConstants.GET_ACTIVE_SUBSCRIPTIONS_SYS_ID_FOR_APP,
                LicensingEngineConstants.ACTIVE_ASSOCIATED_SUBSCRIPTIONS.concat(LicensingEngineConstants.COLON).concat(appId));

        return activeAppSubscriptions;
    },

    loadAllDataIntoCache: function() {
        this.loadInstanceEntitledAppsIntoCache();
    },

    /**
     * Queries subscription_has_app table and loads the app_id's having an active entitlement in to cache 
     */
    loadInstanceEntitledAppsIntoCache: function() {
        let entitledApps = this._loadEntitledAppsData();
        // entitledApps	set will contain [app_id1,app_id2..] if app_id1,app_id2 have a active subscription in the system.
        this.cacheManager.putDataIntoCache(LicensingEngineConstants.LICENSING_CACHE_CATALOG, LicensingEngineConstants.ENTITLED_APPS_CACHE, entitledApps);
    },

    /**
     * Internal method to load entitled apps data from database
     * @returns {Set} Set of entitled app IDs
     */
    _loadEntitledAppsData: function() {
        let entitledApps = new Set();
        let subscriptionAppGR = new GlideRecord(LicensingEngineDBConstants.SUBSCRIPTION_HAS_APP);
        if (subscriptionAppGR.isValid() && subscriptionAppGR.isValidField(LicensingEngineDBConstants.SUBSCRIPTION) && subscriptionAppGR.isValidField(LicensingEngineDBConstants.APPLICATION)) {
            const appIdField = LicensingEngineDBConstants.APPLICATION.concat(LicensingEngineConstants.DOT).concat(LicensingEngineDBConstants.APP_ID);
            const subscriptionStatusField = LicensingEngineDBConstants.SUBSCRIPTION.concat(LicensingEngineConstants.DOT).concat(LicensingEngineDBConstants.STATUS);
            subscriptionAppGR.addQuery(subscriptionStatusField, LicensingEngineDBConstants.IN, LicensingEngineDBConstants.DEFAULT_STATUS_TO_CHECK);
            subscriptionAppGR.query();
            while (subscriptionAppGR.next())
                entitledApps.add(subscriptionAppGR.getElement(appIdField).getDisplayValue());
        }
        return entitledApps;
    },

    /**
     * Returns the set of apps that have an active entitlement
     * 
     * Uses local copy pattern to prevent race condition:
     * - Loads data into local variable (not re-fetched from cache)
     * - Returns local copy even if cache is flushed concurrently
     * - Other threads reload on cache miss (self-healing)
     * 
     * @returns {Set} Set of entitled app IDs
     */
    getEntitledApps: function() {
        var data = this.cacheManager.getDataFromCache(LicensingEngineConstants.LICENSING_CACHE_CATALOG, LicensingEngineConstants.ENTITLED_APPS_CACHE);
        if (gs.nil(data)) {
            // Load data locally
            data = this._loadEntitledAppsData();
            // Cache for other threads
            this.cacheManager.putDataIntoCache(LicensingEngineConstants.LICENSING_CACHE_CATALOG, LicensingEngineConstants.ENTITLED_APPS_CACHE, data);
        }
        // Return local variable if cache doesn't exist - immune to concurrent cache flush
        return data;
    },

    /**
     * Returns true if the given app_id has an active entitlement. Tolerates a casing mismatch
     * between the caller's appId and how it's stored in subscription_has_app (DEF0896792) by
     * trying the exact value first, then lower/upper case.
     */
    isAppEntitled: function(appId) {
        const entitledApps = this.getEntitledApps();
        if (gs.nil(entitledApps))
            return false;
        if (entitledApps.has(appId) || gs.nil(appId))
            return entitledApps.has(appId);
        return entitledApps.has(String(appId).toLowerCase()) || entitledApps.has(String(appId).toUpperCase());
    },

    type: 'SubscriptionHasAppDAO'
};
