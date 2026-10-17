var UnallocatedGroupRecommendationProvider_UnallocatedGroupRecommendationViewDao = Class.create();
UnallocatedGroupRecommendationProvider_UnallocatedGroupRecommendationViewDao.prototype = {
    initialize: function() {},

    getRecommendations: function(subscriptionId) {
        const gr = new GlideRecord('sn_sub_man_unallocated_group_recommendations_active_view');
        if (subscriptionId && subscriptionId.length > 0)
            gr.addQuery('sd_subscription', subscriptionId);
        // Setting remote table row limit to 20000
        gr.setLimit(20000);
        gr.query();

        const rows = [];
        while (gr.next()) {
            if (!gr.gad_group?.name)
                continue; // if the group name is not resolvable, then domain seperation may be responsible for restricting access to the group and should not result in an output entry

            rows.push({
                sys_id: gr.getValue('gad_group'),
                subscription: gr.getValue('sd_subscription'),
                group: gr.getValue('gad_group'),
                weight: gr.getValue('ugr_weight'),
                ui_visible: gr.getValue('m2m_ui_visible')
            });
        }
        return rows;
    },

    getGroupIdsBySubscriptionAndExcludedGroups: function(subscriptionSysId, excludedGroupId) {
        const gr = new GlideRecord('sn_sub_man_unallocated_group_recommendations_active_view');
        const groupsToAdd = new Set();
        gr.addQuery('sd_subscription', subscriptionSysId);
        gr.addQuery('gad_group', 'NOT IN', excludedGroupId);
        gr.query();
        while (gr.next()) {
            if (!gr.gad_group?.name)
                continue;

            groupsToAdd.add(gr.getValue('gad_group'));
        }
        return Array.from(groupsToAdd);
    },

    type: 'UnallocatedGroupRecommendationProvider_UnallocatedGroupRecommendationViewDao'
};
