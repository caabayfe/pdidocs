var UnallocatedEntityRule_RuleFactory = Class.create();
UnallocatedEntityRule_RuleFactory.prototype = {
    initialize: function(subscriptionsContext, entityContext) {
        this._subscriptionsContext = subscriptionsContext;
        this._entityContext = entityContext;

        this._ruleRoleIsNotSubscribed = new sn_entitlement.UnallocatedEntityRule_RoleIsNotSubscribed(subscriptionsContext, entityContext);
        this._ruleRoleRequiresASubscription = new sn_entitlement.UnallocatedEntityRule_RoleRequiresASubscription(subscriptionsContext, entityContext);
        this._ruleRoleIsNotCoveredByUnrestrictedUser = new sn_entitlement.UnallocatedEntityRule_RoleIsNotCoveredByUnrestrictedUser(subscriptionsContext, entityContext);
        this._ruleRoleIsNotCoveredByModule = new sn_entitlement.UnallocatedEntityRule_RoleIsNotCoveredByModule(subscriptionsContext, entityContext);
    },

    /**
     * Retrieves the rules that apply across all subscriptions
     * (e.g. determining if a user/group is unallocated in general terms not subscription specific)
     *
     * @returns {array} An array of rule objects
     */
    getRulesByGlobal: function() {
        return [this._ruleRoleRequiresASubscription, this._ruleRoleIsNotCoveredByUnrestrictedUser, this._ruleRoleIsNotCoveredByModule, this._ruleRoleIsNotSubscribed];
    },

    type: 'UnallocatedEntityRule_RuleFactory'
};
