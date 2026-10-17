var SubscriptionOverviewProvider_SubscriptionDetailDao = Class.create();
SubscriptionOverviewProvider_SubscriptionDetailDao.prototype = {
    initialize: function() {
        this._subscriptionUsageUtils = new sn_entitlement.SubscriptionUsageUtils();
        this._calcualtedFieldSubscriptionDetailStatus = new sn_entitlement.CalculatedFieldSubscriptionDetailStatus();
    },

    getSubscriptionDetailRecordsByActive: function(subscriptionIdsDisplayable, includeUnconfirmedData) {
        const gr = new GlideRecord('subscription_detail');
        gr.addQuery('subscription', 'IN', subscriptionIdsDisplayable);
        gr.addQuery('is_latest', true);
        gr.query();

        const records = [];
        while (gr.next()) {
            records.push({
                sys_id: gr.getValue('sys_id'),
                subscription: gr.getValue('subscription'),
                status: this._calcualtedFieldSubscriptionDetailStatus.calculateStatus(gr),
                allocated_count: this._subscriptionUsageUtils.calculateStringAllocation(gr),
                unconfirmed_user_count_display: includeUnconfirmedData ? this._subscriptionUsageUtils.calculateRealTimeUnconfirmedUsers(gr, 'true') : null,
            });
        }
        return records;
    },

    type: 'SubscriptionOverviewProvider_SubscriptionDetailDao'
};
