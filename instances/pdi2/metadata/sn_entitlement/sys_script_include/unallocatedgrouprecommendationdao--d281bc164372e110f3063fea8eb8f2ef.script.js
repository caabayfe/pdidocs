var UnallocatedGroupRecommendationDao = Class.create();
UnallocatedGroupRecommendationDao.prototype = {
    initialize: function() {},
    insert: function(unallocated_subscription_id, group_allocation_data_id, weight, qualifying_data) {
        const gr = new GlideRecord('unallocated_group_recommendation');
        gr.initialize();
        gr.subscription = unallocated_subscription_id;
        gr.group_allocation_data = group_allocation_data_id;
        gr.weight = weight;
        gr.qualifying_data = JSON.stringify(qualifying_data);
        gr.insert();
    },

    getGroupIsRecommendedBySubscriptionAndExcludedGroup: function(subscriptionSysId, excludedGroupId) {
        const gr = new GlideRecord('unallocated_group_recommendation');
        const groupsToAdd = new Set();
        gr.addQuery('subscription', subscriptionSysId);
        gr.addQuery('group_allocation_data.group', 'NOT IN', excludedGroupId);
        gr.query();
        while (gr.next()) {
            groupsToAdd.add(gr.group_allocation_data.group.toString());
        }
        return Array.from(groupsToAdd);
    },

    type: 'UnallocatedGroupRecommendationDao'
};
