var UnallocatedEntityRule_RoleIsMeteredForThisSubscription = Class.create();
UnallocatedEntityRule_RoleIsMeteredForThisSubscription.prototype = {
    initialize: function(subscriptionsContext, entityContext, subscriptionId) {
        this._subscriptionsContext = subscriptionsContext;
        this._entityContext = entityContext;
        this._subscriptionId = subscriptionId;

        this._qualifyingDataBuilder = new sn_entitlement.UnallocatedEntityRule_RuleQualifyingDataBuilder(UnallocatedEntityRule_RoleIsMeteredForThisSubscription.prototype.type);
    },

    /**
     * Test if the role is required for this specific subscription
     * 
     * @param {guid} roleId The sys_user_role.sys_id to test
     * @returns {bool} True if the role is required for this subscription
     */
    test: function(roleId) {
        const result = this._getRoleIdsMeteredForThisSubscription().indexOf(roleId) > -1;
        this._qualifyingDataBuilder.addTestResult(roleId, result);
        return result;
    },

    /**
     * Retrieve the qualifying data generated from this rule instance
     *
     * @returns {object} An object representing the rule, test executions, and the data used
     */
    getQualifyingData: function() {
        this._qualifyingDataBuilder.addData('role_ids_metered_for_subscription', this._getRoleIdsMeteredForThisSubscription());
        return this._qualifyingDataBuilder.getQualifyingData();
    },

    /**
     * Retrieves the subscribed role ids
     *
     * @returns {array} An array of sys_user_role.sys_id values that are subscribed for the entity (e.g. user or group)
     */
    _getRoleIdsMeteredForThisSubscription() {
        // Only fetch this data once per instance of this class
        if (!this._roleIdsMeteredForThisSubscription)
            this._roleIdsMeteredForThisSubscription = this._subscriptionsContext.getRoleIdsBySubscriptionIdAndRequiresASubscription(this._subscriptionId);
        return this._roleIdsMeteredForThisSubscription;
    },

    type: 'UnallocatedEntityRule_RoleIsMeteredForThisSubscription'
};
