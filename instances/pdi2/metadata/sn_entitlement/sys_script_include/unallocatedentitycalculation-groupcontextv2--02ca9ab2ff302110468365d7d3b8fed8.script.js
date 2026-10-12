var UnallocatedEntityCalculation_GroupContextV2 = Class.create();
UnallocatedEntityCalculation_GroupContextV2.prototype = {

    /**
     * @param {guid} groupId The sys_user_group.sys_id the context represents
     * @param {bool} oobRolesOnly A boolean flag that filters the roles to out-of-box roles when true.
     * @param {bool} subscriptionContext The active subscription context object
     * @param {bool} groupHasRoleCache Group role membership cache object
     */
    initialize: function(groupId, oobRolesOnly, subscriptionContext, groupHasRoleCache) {
        this._groupId = groupId;

        this._subscriptionEntitlementDao = new sn_entitlement.PassThroughCache(new sn_entitlement.SubscriptionEntitlementDao());
        this._subscriptionRoleService = new sn_entitlement.SubscriptionRoleService(oobRolesOnly);
        this._groupHasRoleCache = groupHasRoleCache;
    },

    /**
     * The key used to identify the sys_user_group.sys_id value
     * 
     * @returns {string} A string to be used as a key
     */
    getEntityKeyName: function() {
        return 'sys_user_group.sys_id';
    },

    /**
     * The ID value for the sys_user_group.sys_id output
     * 
     * @returns {string} A string to be used as the value to identify this record
     */
    getEntityKeyValue: function() {
        return this._groupId;
    },

    /**
     * Retrieves the subscription Ids the group is subscribed to
     *
     * @returns {array} An array of subscription_entitlement.sys_id values
     */
    getSubscriptionIdsSubscribed: function() {
        return this._subscriptionEntitlementDao.getSubscriptionIdsByGroupIdAndIsPerUser(this._groupId);
    },

    /**
     * Retrieves all of the role IDs assigned to a group.
     * 
     * @returns {array} An array of sys_user_role.sys_id values
     */
    getRoleIdsAssigned: function() {
        return this._groupHasRoleCache.getRoleIdsByGroupId(this._groupId);
    },

    /**
     * Retrieves all of the role IDs subscribed to by a group.
     * 
     * @returns {array} An array of sys_user_role.sys_id values
     */
    getRoleIdsSubscribed: function() {
        const roleIds = this._subscriptionEntitlementDao.getSubscriptionIdsByGroupIdAndIsPerUser(this._groupId)
            .flatMap(subscriptionId => this._subscriptionRoleService.getRoleIdsBySubscriptionIdAndRequiresASubscription(subscriptionId));
        return Array.from(new Set(roleIds));
    },

    type: 'UnallocatedEntityCalculation_GroupContextV2'
};
