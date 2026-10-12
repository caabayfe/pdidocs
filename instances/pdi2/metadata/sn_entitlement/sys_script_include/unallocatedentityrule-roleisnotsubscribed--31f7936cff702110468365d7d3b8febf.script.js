var UnallocatedEntityRule_RoleIsNotSubscribed = Class.create();
UnallocatedEntityRule_RoleIsNotSubscribed.prototype = {
    initialize: function(subscriptionsContext, entityContext) {
        this._subscriptionsContext = subscriptionsContext;
        this._entityContext = entityContext;

        this._qualifyingDataBuilder = new sn_entitlement.UnallocatedEntityRule_RuleQualifyingDataBuilder(UnallocatedEntityRule_RoleIsNotSubscribed.prototype.type);
    },

    /**
     * Test if the role has a matching subscribed roleId
     * 
     * @param {guid} roleId The sys_user_role.sys_id to test
     * @returns {bool} True if the role is not have a matching subscribed role
     */
    test: function(roleId) {
        const result = !this._getRoleIdsSubscribed().has(roleId);
        this._qualifyingDataBuilder.addTestResult(roleId, result);
        return result;
    },

    /**
     * Retrieve the qualifying data generated from this rule instance
     *
     * @returns {object} An object representing the rule, test executions, and the data used
     */
    getQualifyingData: function() {
        this._qualifyingDataBuilder.addData('role_ids_subscribed', this._getRoleIdsSubscribed());
        return this._qualifyingDataBuilder.getQualifyingData();
    },

    /**
     * Retrieves the subscribed role ids
     *
     * @returns {Set} A Set of sys_user_role.sys_id values that are subscribed for the entity (e.g. user or group)
     */
    _getRoleIdsSubscribed() {
        // Only fetch this data once per instance of this class
        if (!this._roleIdsSubscribed)
            this._roleIdsSubscribed = new Set(this._entityContext.getSubscriptionIdsSubscribed()
                .flatMap(subscriptionId => this._subscriptionsContext.getRoleIdsBySubscriptionIdAndRequiresASubscription(subscriptionId)));
        return this._roleIdsSubscribed;
    },

    type: 'UnallocatedEntityRule_RoleIsNotSubscribed'
};
