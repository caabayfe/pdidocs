var SubscriptionRoleService = Class.create();
SubscriptionRoleService.prototype = {

    /**
     * @param {bool} oobRolesOnly A boolean flag that filters the roles to out-of-box roles when true.
     */
    initialize: function(oobRolesOnly) {
        this._oobRolesOnly = oobRolesOnly;

        this._licenseRoleTypeDao = new sn_entitlement.PassThroughCache(new sn_entitlement.LicenseRoleTypeDao());
        this._subscriptionEntitlementDao = new sn_entitlement.PassThroughCache(new sn_entitlement.SubscriptionEntitlementDao());
        this._userRoleDao = new sn_entitlement.PassThroughCache(new sn_entitlement.UserRoleDao());
    },

    /**
     * Retrieves an array of sys_user_role.sys_id values that require a subscription
     * This is the super-set of all roles requiring a subscription (across all subscriptions)
     *
     * @returns {array} An array of sys_user_role.sys_id values
     */
    getRoleIdsByRequiresASubscription: function() {
        const roleIds = this._subscriptionEntitlementDao.getSubscriptionIdsByIsPerUser()
            .flatMap(this.getRoleIdsBySubscriptionIdAndRequiresASubscription.bind(this));
        return Array.from(new Set(roleIds));
    },

    /**
     * Retrieves an array of sys_user_role.sys_id values that require a subscription for the provided subscriptionId
     * This is just the set of roles requiring a subscription for this specific subscription
     *
     * @param {guid} subscriptionId The subscription_entitlement.sys_id of the subscription to get sys_user_role.sys_id values for
     * @returns {array} An array of sys_user_role.sys_id values
     */
    getRoleIdsBySubscriptionIdAndRequiresASubscription: function(subscriptionId) {
        const licensableRoleTypeNames = this._licenseRoleTypeDao.getLicenseRoleTypeNamesBySubscriptionId(subscriptionId);
        return this._userRoleDao.getUserRoleIdsBySubscriptionIdAndLicenseRoleTypeNames(subscriptionId, licensableRoleTypeNames, this._oobRolesOnly);
    },

    /**
     * Retrieves all role IDs associated with the subscription identified even if the role is not
     * a metered role for the subscription
     *
     * @param {guid} subscriptionId The subscription ID to get roles for
     * @returns {array} An array of role IDs associated with the subscription
     */
    getRoleIdsBySubscriptionId: function(subscriptionId) {
        return this._userRoleDao.getRoleIdsBySubscriptionId(subscriptionId, this._oobRolesOnly);
    },

    type: 'SubscriptionRoleService'
};
