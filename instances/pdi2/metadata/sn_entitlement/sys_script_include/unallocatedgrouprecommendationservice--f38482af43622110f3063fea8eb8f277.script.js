var UnallocatedGroupRecommendationService = Class.create();
UnallocatedGroupRecommendationService.prototype = {
    initialize: function() {
        this._subscriptionEntitlementDao = new SubscriptionEntitlementDao();
        this._groupAllocationDataDao = new dao_GroupAllocationDataDao();
        this._licenseRoleTypeDao = new LicenseRoleTypeDao();
        this._userRoleDao = new UserRoleDao();
        this._unallocatedGroupRecommendationDao = new UnallocatedGroupRecommendationDao();
        this._contextFactory = new sn_entitlement.UnallocatedEntityCalculation_ContextFactory();

        const subscriptionEntitlementIds = this._subscriptionEntitlementDao.getSubscriptionIdsByIsPerUser();
        this._subscriptionToMeasuredRoleIdsMap = this._getSubscriptionToMeasuredRoleIds(subscriptionEntitlementIds);
    },

    /**
     * Generates group recommendations and persists them to the database
     * 
     * @param groupAllocationDataId The group_allocation_data.sys_id to generate recommendations for
     */
    createRecommendations: function(groupAllocationDataId) {
        if (this._contextFactory.v2SchemaIsInUse())
            this._recommendSubscriptions(groupAllocationDataId, this._subscriptionToMeasuredRoleIdsMap);
    },

    _recommendSubscriptions: function(group_allocation_data_id, subscriptionToMeasuredRoleIdsMap) {
        const groupAllocationData = this._groupAllocationDataDao.getEntityAllocationDataObjectByGroupAllocationDataId(group_allocation_data_id);
        const unsubscribed_roles = groupAllocationData.unsubscribed_roles;
        for (let unallocated_subscription_id of groupAllocationData.unallocated_subscription_ids) {
            const measuredRoleIds = subscriptionToMeasuredRoleIdsMap[unallocated_subscription_id];
            const qualifiedRoles = unsubscribed_roles.filter(id => measuredRoleIds.indexOf(id) > -1);
            const match_count = qualifiedRoles.length;
            if (match_count > 0) {
                this._unallocatedGroupRecommendationDao.insert(unallocated_subscription_id, group_allocation_data_id, match_count, {
                    "qualified_roles": qualifiedRoles
                });
            }
        }
    },

    _getSubscriptionToMeasuredRoleIds: function(subscriptionEntitlementIds) {
        const subscriptionToMeasuredRoleIds = {};
        for (let i = 0; i < subscriptionEntitlementIds.length; i++) {
            const subscriptionId = subscriptionEntitlementIds[i];
            const licensableRoleTypeNames = this._licenseRoleTypeDao.getLicenseRoleTypeNamesBySubscriptionId(subscriptionId);
            const subscriptionToRoleIds = this._userRoleDao.getUserRoleIdsBySubscriptionIdAndLicenseRoleTypeNames(subscriptionId, licensableRoleTypeNames);
            subscriptionToMeasuredRoleIds[subscriptionId] = subscriptionToRoleIds;
        }
        return subscriptionToMeasuredRoleIds;
    },

    type: 'UnallocatedGroupRecommendationService'
};
