var dao_CreatorSubscription = Class.create();
dao_CreatorSubscription.prototype = {
    initialize: function() {
        this.LOGGER = new sn_log.GlideLogger("sn_entitlement.dao_CreatorSubscription");
        this.daoSubscriptionDetail = new sn_entitlement.SubscriptionDetailDao();
        this.daoSubscriptionEntitelement = new sn_entitlement.SubscriptionEntitlementDao();
    },

    /**
     * Looks up the latest subscription_detail record for Creator Plus subscription
     * 
     * @returns sys_id of the subscription_detail record if found, otherwise null;
     */
    getLatestSubscriptionDetailId: function() {
        let subscriptionDetail = this.getLatestSubscriptionDetailRecord();
        if (!subscriptionDetail) {
            return null;
        }

		return subscriptionDetail.getValue("sys_id");
    },

    /**
     * Looks up the latest subscription_detail record for Creator Plus subscription
     * @returns GlideRecord
     */
    getLatestSubscriptionDetailRecord: function() {
        const subscriptionId = this.getActiveSubscriptionEntitlementId();
        let subscriptionDetail = this.daoSubscriptionDetail.getLatestSubscriptionDetailBySubscriptionId(subscriptionId);
        if (!subscriptionDetail) {
            this.LOGGER.debug("No subscription detail record for creator meter_type");
            return null;
        }

		return subscriptionDetail;
    },

    /**
     * Looks up the subscription_entitlement record for Creator Plus subscription
     * @returns sys_id
     */
    getActiveSubscriptionEntitlementId: function() {
        let subscription = this.daoSubscriptionEntitelement.getActiveSubscriptionIdsByMeterType("creator");
        // only one such subscription for creator meter_type
        if (subscription.length === 0) {
            this.LOGGER.debug("Subscription entitlement record not found for creator meter_type");
            return null;
        }

        if (subscription.length > 1) {
            this.LOGGER.debug("More than one subscription entitlement record for creator meter_type");
            return null;
        }

        return subscription[0];
    },

    type: 'dao_CreatorSubscription'
};
