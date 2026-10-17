var UnallocatedGroupRecommendationProvider_SubscriptionEntitlementDao = Class.create();
UnallocatedGroupRecommendationProvider_SubscriptionEntitlementDao.prototype = {
    initialize: function() {},

    getSubscriptionMeasuredRoleTypesMap: function(subscriptionIds) {
        if (!subscriptionIds || subscriptionIds.length === 0)
            return new Map();

        const gr = new GlideRecord('subscription_entitlement');
        gr.addQuery('sys_id', 'IN', subscriptionIds);
        gr.query();

        const map = new Map();
        while (gr.next()) {
            const subscriptionId = gr.getValue('sys_id');
            const measuredRoleTypes = gr.getValue('measured_role_types');
            map.set(subscriptionId, measuredRoleTypes);
        }
        return map;
    },

    type: 'UnallocatedGroupRecommendationProvider_SubscriptionEntitlementDao'
};
