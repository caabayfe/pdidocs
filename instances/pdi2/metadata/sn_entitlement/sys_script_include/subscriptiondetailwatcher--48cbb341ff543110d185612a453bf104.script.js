var SubscriptionDetailWatcher = Class.create();
SubscriptionDetailWatcher.prototype = {
    initialize: function() {
        this._entitlementDao = new sn_entitlement.SubscriptionEntitlementDao();
        this._detailsDao = new sn_entitlement.dao_SubscriptionDetail();
        this._contextFactory = new sn_entitlement.UnallocatedEntityCalculation_ContextFactory();
    },

    /**
     * Initiates execution of subscription_detail generation IFF for all active subscription_entitlement records 
     *  that are at least 2 days old, there is NOT at least one matching subscription_detail record with 
     *  is_latest = true or if its subscription_detail record with is_latest = true has a calculated_on date 
     *  greater than 36 hours ago
     */
    run: function() {
        if (!this._contextFactory.v2SchemaIsInUse()) {
            gs.info("SubscriptionDetailWatcher: aborting due to v1 schema in use.");
            return;
        }

        const subscriptionEntitlements = this._entitlementDao.getActiveSubscriptionEntitlementsOlderThanDays(2);
        if (subscriptionEntitlements.length == 0)
            return;

        const times = this._detailsDao.getLatestSubscriptionDetailsCalculatedOnBySubscription(subscriptionEntitlements);
        if (times.length < subscriptionEntitlements.length) {
            gs.info("SubscriptionDetailWatcher: detected missing subscription_detail entry, regnerating.");
            this.executeSubscriptionDetails();
            return;
        }
        for (let i = 0; i < times.length; i++) {
            if (times[i] < gs.hoursAgo(36)) {
                gs.info("SubscriptionDetailWatcher: detected stale subscription_detail entry, regenerating.");
                this.executeSubscriptionDetails();
                return;
            }
        }
    },

    executeSubscriptionDetails: function() {
        new sn_entitlement.SubscriptionDetailService().createSubscriptionDetailsSafely();
    },

    type: 'SubscriptionDetailWatcher'
};
