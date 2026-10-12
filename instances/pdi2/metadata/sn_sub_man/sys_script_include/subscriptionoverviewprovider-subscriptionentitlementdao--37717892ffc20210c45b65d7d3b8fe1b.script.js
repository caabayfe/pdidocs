var SubscriptionOverviewProvider_SubscriptionEntitlementDao = Class.create();
SubscriptionOverviewProvider_SubscriptionEntitlementDao.prototype = {
    initialize: function() {},

    getSubscriptionEntitlementRecordsByDisplayable: function() {
        const gr = new GlideRecord('subscription_entitlement');
        gr.addQuery('display_type', '!=', 2); // Display Type != Hide
        gr.addNullQuery('meter_type')
            .addOrCondition('meter_type', '!=', 'Assist');
        gr.addNullQuery('entitlement_type')
            .addOrCondition('entitlement_type', '=', 0)
            .addOrCondition('entitlement_type', '=', 2);
        gr.query();

        const records = [];
        while (gr.next()) {
            records.push({
                sys_id: gr.getValue('sys_id'),
                subscription_type: parseInt(gr.getValue('subscription_type')),
                purchased_count: gr.getValue('purchased_count'),
                start_date: gr.getValue('start_date'),
                end_date: gr.getValue('end_date'),
            });
        }
        return records;
    },

    type: 'SubscriptionOverviewProvider_SubscriptionEntitlementDao'
};
