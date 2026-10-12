var GroupAllocationService = Class.create();
GroupAllocationService.prototype = {
    initialize: function() {
        this._subscriptionDetailService = new sn_entitlement.SubscriptionDetailService();
        this._unallocatedGroupRecommendationDao = new sn_entitlement.UnallocatedGroupRecommendationDao();
    },
    
    isUserAllocationDisplayEnabled: function () {
		const allocationIsEnabled = gs.getProperty('sn_sub_man.per_user_allocation_info_display_enabled', 'false') === 'true';
		const unconfirmedUsersIsEnabled = gs.getProperty('sn_sub_man.unconfirmed_user_flow_enabled', 'false') === 'true';
		
		return unconfirmedUsersIsEnabled || allocationIsEnabled;
	},

    getEntityCountByGroupIds: function(groupIds) {
        const gr = new GlideAggregate('sys_user_grmember');
        gr.addAggregate('COUNT');
        gr.addQuery('group', 'IN', groupIds);
        gr.query();

        let userCount = 0;
        while (gr.next())
            userCount += parseInt(gr.getAggregate('COUNT'));
        return userCount + groupIds.length;
    },

    addGroupsToSubscription: function(groupIds, subscriptionId) {
        const groupIdsAlreadyMapped = new Set(this._getGroupIdsBySubscriptionId(subscriptionId));

        const groupIdsToInsert = groupIds.filter(groupId => !groupIdsAlreadyMapped.has(groupId));

        groupIdsToInsert.forEach(groupId => {
            try {
                const gr = new GlideRecord('group_has_subscription');
                gr.initialize();
                gr.setValue('group', groupId);
                gr.setValue('subscription', subscriptionId);
                gr.insert();
            } catch (err) {
                const errMessage = 'Could not add groups to subscription for subscription id: ' + subscriptionId;
                gs.error(errMessage + ' with error ' + err.message);
            }
        });
    },

    addGroupMembersToSubscription: function(groupIds, subscriptionId) {
        const map = new Map();
        map.set(subscriptionId, groupIds);
        try {
            new sn_entitlement.UserSubscriptionMapper().syncUserForGroupsAddedToSubscription(map);
        } catch (e) {
            gs.info("Unable to sync user_has_subscription records for subscription with sys_id " + subscriptionId + ": " + e);
        }
    },

    removeGroupsFromSubscription(groupIds, subscriptionId) {
        try {
            const gr = new GlideRecord('group_has_subscription');
            gr.addQuery('subscription', subscriptionId);
            gr.addQuery("group", 'IN', groupIds);
            gr.query();
            gr.deleteMultiple();
        } catch (err) {
            const errMessage = 'Could not delete groups from subscription with subscription id: ' + subscriptionId;
            gs.error(errMessage + ' with error ' + err.message);
        }
    },

    removeGroupMembersFromSubscription: function(groupIds, subscriptionId) {
        const map = new Map();
        map.set(subscriptionId, groupIds);
        try {
            new sn_entitlement.UserSubscriptionMapper().syncUserForGroupsDeletedFromSubscription(map);
        } catch (e) {
            gs.info("Unable to sync user_has_subscription records for subscription with sys_id " + subscriptionId + ": " + e);
        }
    },

    executePartialUpdateForGroups: function(groupIds) {
        this._subscriptionDetailService.partialUpdateSubscriptionDetailsByGroups(groupIds);
    },

    getAllRecommendedGroupsBySubscription: function(subscriptionId, excludedGroupId) {
        return this._unallocatedGroupRecommendationDao.getGroupIsRecommendedBySubscriptionAndExcludedGroup(subscriptionId, excludedGroupId);
    },

    _getGroupIdsBySubscriptionId: function(subscriptionId) {
        const gr = new GlideRecord('group_has_subscription');
        gr.addQuery('subscription', subscriptionId);
        gr.query();

        const groupIds = [];
        while (gr.next())
            groupIds.push(gr.getValue('group'));
        return groupIds;
    },

    getAllGroupsIdsWithExceptedRecordsBySubscriptionId: function(subscriptionSysId, exceptedGroupIds) {
        const gr = new GlideRecord('group_has_subscription');
        const groupsToRemove = new Set();
        gr.addQuery('subscription', subscriptionSysId);
        gr.addQuery('group', 'NOT IN', exceptedGroupIds);
        gr.query();
        while (gr.next()) {
            if (!gr.group?.name)
                continue;

            groupsToRemove.add(gr.group.toString());
        }
        return Array.from(groupsToRemove);
    },

    type: 'GroupAllocationService'
};
