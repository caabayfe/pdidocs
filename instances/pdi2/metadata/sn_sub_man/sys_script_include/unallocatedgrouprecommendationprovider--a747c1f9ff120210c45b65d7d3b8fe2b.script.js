var UnallocatedGroupRecommendationProvider = Class.create();
UnallocatedGroupRecommendationProvider.prototype = {
    initialize: function() {
        this._unallocatedGroupRecommendationViewDao = new sn_sub_man.UnallocatedGroupRecommendationProvider_UnallocatedGroupRecommendationViewDao();
        this._subscriptionEntitlementDao = new sn_sub_man.UnallocatedGroupRecommendationProvider_SubscriptionEntitlementDao();
        this._userGrmemberDao = new sn_sub_man.UnallocatedGroupRecommendationProvider_UserGrmemberDao();
        this._userDao = new sn_entitlement.UserDao();
    },

    getData: function(subscriptionId) {
        const recommendations = this._unallocatedGroupRecommendationViewDao.getRecommendations(subscriptionId);
        // de-dup
        const recommendationsSysIds = Array.from(new Set(recommendations.map(row => row.subscription)));
        const subscriptionsMap = this._subscriptionEntitlementDao.getSubscriptionMeasuredRoleTypesMap(recommendationsSysIds);
        const groupIds = recommendations.map(row => row.group);
        const groupsMap = this._userGrmemberDao.getGroupUserCountsMap(groupIds);
        const groupsActiveUserMap = this._userDao.getActiveGroupMembersCountByGroupIDs(groupIds);


        return recommendations
            .map(row => this._addRoleTypes(subscriptionsMap, row))
            .map(row => this._addGroupUserCounts(groupsMap, groupsActiveUserMap, row));
    },

    _addRoleTypes: function(subscriptionsMap, row) {
        if (!subscriptionsMap)
            return row;

        row.role_types = subscriptionsMap.get(row.subscription);
        return row;
    },

    _addGroupUserCounts: function(groupsMap, groupsActiveUserMap, row) {
        if (!groupsMap)
            return row;

        const userCount = groupsMap.get(row.group) | 0;
        row.user_count = userCount.toString();
        row.user_count_int = userCount;

        const activeUserCount = groupsActiveUserMap.get(row.group) | 0;
        row.active_users_count = activeUserCount.toString();
        row.active_users_count_int = activeUserCount;

        return row;
    },

    type: 'UnallocatedGroupRecommendationProvider'
};
