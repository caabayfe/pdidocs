var FGEEntitlementProcessor = Class.create();
FGEEntitlementProcessor.prototype = {
    initialize: function() {
        this.instanceInfoUtil = new InstanceInfoUtil();
        this._cacheManager = new LicensingCacheManager();
        this.logger = new LoggingUtil();
        this.cacheDataHandler = new CacheDataHandler();
    },

    /**
     * Checks for the given fgeId into the cache, If cache object is empty then reload the subscrition entitlement cache and 
     * then validate if given fge is present for the active subscription.
     * @param {string} fgeId
     */
    isEntitled: function(fgeId) {
        try {
               // Use getter method with local copy pattern to avoid race condition
               // On cache miss: loads data locally, populates cache for other threads, returns local copy (immune to concurrent cache flush)
               var entitlmentIdToSubscriptionObj = new SubscriptionEntitlementDAO().getSubscriptionEntitlements();
            if (!global.LicensingScriptUtil.nil(entitlmentIdToSubscriptionObj)) {
                for (let [entitlementId, subscriptionObjectList] of entitlmentIdToSubscriptionObj) {
                    if (global.LicensingScriptUtil.nil(subscriptionObjectList))
                        continue;
                    for (let subscriptionObject of subscriptionObjectList) {
                        if (!global.LicensingScriptUtil.nil(subscriptionObject) && !global.LicensingScriptUtil.nil(subscriptionObject[LicensingEngineDBConstants.FGE_IDS]) && subscriptionObject[LicensingEngineDBConstants.FGE_IDS].toLowerCase().includes(fgeId)) {
                            if (this.logger.isEntitlementLoggingEnabled()) {
                                this.logger.logInfo(LicensingEngineConstants.FGE_ENTITLEMENT_PROCESSOR, LicensingEngineConstants.IS_ENTITLED, " Given fge is present is entitled : " + fgeId);
                            }
                            return true;
                        }
                    }
                }

                if (this.logger.isEntitlementLoggingEnabled()) {
                    entitlmentIdToSubscriptionObj.forEach(function(subscriptionObjectList, entitlementId) {
                        new LoggingUtil().logInfo(LicensingEngineConstants.FGE_ENTITLEMENT_PROCESSOR, LicensingEngineConstants.IS_ENTITLED, "entitlementId loaded from cache: " + entitlementId);
                        subscriptionObjectList.forEach(function(subscriptionObject) {
                            new LoggingUtil().logInfo(LicensingEngineConstants.FGE_ENTITLEMENT_PROCESSOR, LicensingEngineConstants.IS_ENTITLED, "subscriptionObject loaded from cache: " + JSON.stringify(subscriptionObject));
                        });
                    });

                    const errorMsg = LicensingEngineConstants.LICENSING_ERROR_CODES[LicensingEngineConstants.ENTITLEMENT_API_CODE.NO_FGE_ENTITLEMENT] + fgeId;
                    this.logger.logError(LicensingEngineConstants.FGE_ENTITLEMENT_PROCESSOR, LicensingEngineConstants.IS_ENTITLED, errorMsg, LicensingEngineConstants.ENTITLEMENT_API_CODE.NO_FGE_ENTITLEMENT, LicensingEngineConstants.LICENSING_ERROR_TYPES.ENTITLEMENT_API);
                }
            }

            //If subscription_entitlement_cache is not loaded, return false.
            return false;

        } catch (error) {
            const errorMsg = LicensingEngineConstants.LICENSING_ERROR_CODES[LicensingEngineConstants.ENTITLEMENT_API_CODE.FGE_ERROR] + fgeId + error + " \n " + error.stack;;
            this.logger.logError(LicensingEngineConstants.FGE_ENTITLEMENT_PROCESSOR, LicensingEngineConstants.IS_ENTITLED, errorMsg, LicensingEngineConstants.ENTITLEMENT_API_CODE.FGE_ERROR, LicensingEngineConstants.LICENSING_ERROR_TYPES.ENTITLEMENT_API);

            return false;
        }
    },

    type: 'FGEEntitlementProcessor'
};
