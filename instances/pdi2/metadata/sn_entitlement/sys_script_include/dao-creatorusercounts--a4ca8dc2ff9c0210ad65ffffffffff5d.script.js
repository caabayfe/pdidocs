var dao_CreatorUserCounts = Class.create();
dao_CreatorUserCounts.prototype = {
    initialize: function() {
        this.LOGGER = new sn_log.GlideLogger("sn_entitlement.dao_CreatorUserCounts");
        this.daoCreatorSubscription = new sn_entitlement.dao_CreatorSubscription();
    },

    /**
     * Fetches the confirmed and unconfirmed user count from subscription detail. 
     * It returns persisted count and not the real-time count.
     * 
     * @returns object with keys confirmed_user_count, unconfirmed_user_count.
     *          If no subscription_detail record found, returns empty obj
     */
    getPersistedCounts: function() {
        let subscriptionDetail = this.daoCreatorSubscription.getLatestSubscriptionDetailRecord();
        if (!subscriptionDetail) {
            this.LOGGER.debug("No subscription detail record for creator meter_type");
            return {};
        }

        let confirmed_counts = parseInt(subscriptionDetail.getValue("allocated_user_count"));
        let unconfirmed_counts = parseInt(subscriptionDetail.getValue("unconfirmed_user_count"));
        this.LOGGER.debug("confirmed_counts={0} and unconfirmed_counts={1}", '' + confirmed_counts, '' + unconfirmed_counts);

        return {
            "confirmed_user_count" : confirmed_counts,
            "unconfirmed_user_count" : unconfirmed_counts
        }
    },

    type: 'dao_CreatorUserCounts'
};
