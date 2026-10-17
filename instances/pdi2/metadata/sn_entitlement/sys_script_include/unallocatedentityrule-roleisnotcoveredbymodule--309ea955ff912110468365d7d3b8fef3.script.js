var UnallocatedEntityRule_RoleIsNotCoveredByModule = Class.create();
UnallocatedEntityRule_RoleIsNotCoveredByModule.prototype = {
    initialize: function(subscriptionsContext, entityContext) {
        this._subscriptionsContext = subscriptionsContext;
        this._entityContext = entityContext;

        this._qualifyingDataBuilder = new sn_entitlement.UnallocatedEntityRule_RuleQualifyingDataBuilder(this.type);

        this._roleIdsAssociatedModuleSubscriptions = new Set(this._getRoleIdsAssociatedWithModules());
    },

    /**
     * Test if the role should be excluded based on the module subscription rule
     * A role is considered to be covered under the module rule if
     * 1. There is 1 or more active module subscriptions
     * 2. The role is associated with (doesn't need to be metered) any module subscription
     * 
     * @param {guid} roleId The sys_user_role.sys_id to test
     * @returns {bool} True if the role is NOT covered under the user's module subscription(s)
     */
    test: function(roleId) {
        const result = !this._roleIdsAssociatedModuleSubscriptions.has(roleId);
        this._qualifyingDataBuilder.addTestResult(roleId, result);
        return result;
    },

    /**
     * Retrieve the qualifying data generated from this rule instance
     *
     * @returns {object} An object representing the rule, test executions, and the data used
     */
    getQualifyingData: function() {
        this._qualifyingDataBuilder.addData('role_ids_associated_with_module_subscriptions', Array.from(this._roleIdsAssociatedModuleSubscriptions));

        return this._qualifyingDataBuilder.getQualifyingData();
    },

    /**
     * Retrieves all role ids that are associated with any module subscriptions
     */
    _getRoleIdsAssociatedWithModules: function() {
        const moduleSubscriptionIds = this._subscriptionsContext
            .getSubscriptionIdsByIsModule();

        return moduleSubscriptionIds
            .flatMap(subscriptionId => this._subscriptionsContext.getRoleIdsBySubscriptionId(subscriptionId));
    },

    type: 'UnallocatedEntityRule_RoleIsNotCoveredByModule'
};
