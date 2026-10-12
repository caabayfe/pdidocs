var UnallocatedEntityRule_RoleRequiresASubscription = Class.create();
UnallocatedEntityRule_RoleRequiresASubscription.prototype = {
    initialize: function(subscriptionsContext, entityContext) {
        this._subscriptionsContext = subscriptionsContext;
        this._entityContext = entityContext;

        this._qualifyingDataBuilder = new sn_entitlement.UnallocatedEntityRule_RuleQualifyingDataBuilder(UnallocatedEntityRule_RoleRequiresASubscription.prototype.type);
    },

    /**
     * Test if the role requires a subscription
     * 
     * @param {guid} roleId The sys_user_role.sys_id to test
     * @returns {bool} True if the role is a role requiring a subscription
     */
    test: function(roleId) {
        const result = this._getRoleIdsByRequiresASubscription().has(roleId);
        this._qualifyingDataBuilder.addTestResult(roleId, result);
        return result;
    },

    /**
     * Retrieve the qualifying data generated from this rule instance
     *
     * @returns {object} An object representing the rule, test executions, and the data used
     */
    getQualifyingData: function() {
        this._qualifyingDataBuilder.addData('role_ids_requiring_a_subscription', this._getRoleIdsByRequiresASubscription());
        return this._qualifyingDataBuilder.getQualifyingData();
    },

    /**
     * Retrieves a list of role ids that require a subscription
     *
     * @returns {Set} A Set of sys_user_role.sys_id values that require a subscription
     */
    _getRoleIdsByRequiresASubscription() {
        // Only fetch this data once per instance of this class
        if (!this._roleIdsByRequiresASubscription)
            this._roleIdsByRequiresASubscription = new Set(this._subscriptionsContext.getRoleIdsByRequiresASubscription());
        return this._roleIdsByRequiresASubscription;
    },

    type: 'UnallocatedEntityRule_RoleRequiresASubscription'
};
