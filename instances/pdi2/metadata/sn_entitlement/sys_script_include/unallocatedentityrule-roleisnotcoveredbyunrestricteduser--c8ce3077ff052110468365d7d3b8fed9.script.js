var UnallocatedEntityRule_RoleIsNotCoveredByUnrestrictedUser = Class.create();
UnallocatedEntityRule_RoleIsNotCoveredByUnrestrictedUser.prototype = {
    initialize: function(subscriptionsContext, entityContext) {
        this._subscriptionsContext = subscriptionsContext;
        this._entityContext = entityContext;

        this._qualifyingDataBuilder = new sn_entitlement.UnallocatedEntityRule_RuleQualifyingDataBuilder(UnallocatedEntityRule_RoleIsNotCoveredByUnrestrictedUser.prototype.type);

        this._roleIdsAssociatedWithAUUSubscription = new Set(this._getRoleIdsAssociatedWithAnActiveUUSubscription());
    },

    /**
     * Test if the role should be excluded based on the unlimited user subscription rule
     * A role is considered to be covered under UU if
     * 1. There is an active UU subscription
     * 2. The role is associated with the UU subscription
     * 3. The user does NOT have to be subscribed to the UU subscription. It is considered to be implicit
     * 
     * @param {guid} roleId The sys_user_role.sys_id to test
     * @returns {bool} True if the role is NOT covered under the UU subscription
     */
    test: function(roleId) {
        const result = !this._roleIdsAssociatedWithAUUSubscription.has(roleId);
        this._qualifyingDataBuilder.addTestResult(roleId, result);
        return result;
    },

    /**
     * Retrieve the qualifying data generated from this rule instance
     *
     * @returns {object} An object representing the rule, test executions, and the data used
     */
    getQualifyingData: function() {
        this._qualifyingDataBuilder.addData('role_ids_associated_with_uu_subscription', Array.from(this._roleIdsAssociatedWithAUUSubscription));
        return this._qualifyingDataBuilder.getQualifyingData();
    },

    /**
     * Retrieves all role ids that are associated with any active UU subscription
     */
    _getRoleIdsAssociatedWithAnActiveUUSubscription: function() {
        const uuSubscriptionIds = this._subscriptionsContext.getSubscriptionIdsByActiveAndIsUnrestrictedUser();
        return uuSubscriptionIds
            .flatMap(subscriptionId => this._subscriptionsContext.getRoleIdsBySubscriptionId(subscriptionId));
    },

    type: 'UnallocatedEntityRule_RoleIsNotCoveredByUnrestrictedUser'
};
