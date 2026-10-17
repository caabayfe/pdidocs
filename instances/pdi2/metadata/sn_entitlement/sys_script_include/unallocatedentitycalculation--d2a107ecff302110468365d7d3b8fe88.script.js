/**
 * Calculates if a user or group is unallocated
 * The object returned is intended to provide all of the data that was utilized to make the decision
 * so we can understand in prod why a user/group was identified as allocated or unallocated
 */
var UnallocatedEntityCalculation = Class.create();
UnallocatedEntityCalculation.prototype = {
    initialize: function(subscriptionContext, entityContext) {
        this._entityContext = entityContext;
        this._subscriptionsContext = subscriptionContext;

        this._ruleFactory = new sn_entitlement.UnallocatedEntityRule_RuleFactory(subscriptionContext, entityContext);
    },

    /**
     * Calculate if a user is unallocated and return an object with all of the supporting data around the decision.
     *
     * @returns {object} An object that models the user/group id, qualifying data, qualifying roles, unallocated subscriptions, is_unallocated
     */
    calculateUnallocatedData: function() {
        const assignedRoles = this._entityContext.getRoleIdsAssigned();

        const allSubscribeableRoles = this._subscriptionsContext.getRoleIdsByRequiresASubscription();

        const subscribeableRoles = assignedRoles.filter(assignedRole => allSubscribeableRoles.indexOf(assignedRole) >= 0);

		const subscribedRoles = Array.from(new Set(this._entityContext.getSubscriptionIdsSubscribed()
			.flatMap(subscriptionId => this._subscriptionsContext.getRoleIdsBySubscriptionIdAndRequiresASubscription(subscriptionId))));

        const rules = this._ruleFactory.getRulesByGlobal();
        const unsubscribedRoleIds = assignedRoles
            .filter(roleId => rules.every(rule => rule.test(roleId)));

        return new sn_entitlement.EntityAllocationData(
            this._entityContext.getEntityKeyName(),
            this._entityContext.getEntityKeyValue(),
            rules.map(rule => rule.getQualifyingData()),
            assignedRoles,
            subscribeableRoles,
            subscribedRoles,
            unsubscribedRoleIds,
            this._entityContext.getSubscriptionIdsSubscribed(),
            this._getSubscriptionIdsMatchingAtLeastOneRoleId(unsubscribedRoleIds),
            unsubscribedRoleIds.length > 0
        );
    },

    /**
     * Retrieve the subscription ids that match at least one of the role ids provided
     *
     * @param {guid} roleIds The roleIds that subscriptions should be filtered by
     * @returns {array} An array of subscriptionIds
     */
    _getSubscriptionIdsMatchingAtLeastOneRoleId: function(roleIds) {
        return this._subscriptionsContext.getSubscriptionIdsByIsPerUser()
            .filter(subscriptionId => this._isSubscriptionMeteredByAtLeastOneRole(subscriptionId, roleIds));
    },

    /**
     * Determines if a subscription is metered by at least one role in a list of roles
     *
     * @param {guid} subscriptionId The subscriptionId to test if it is metered by one of the role Ids
     * @param {array} An array of roleIds to check if the subscription is metered by
     * @returns {bool} True if the subscription is metered by one of the roleIds
     */
    _isSubscriptionMeteredByAtLeastOneRole: function(subscriptionId, roleIds) {
        return this._subscriptionsContext.getRoleIdsBySubscriptionIdAndRequiresASubscription(subscriptionId)
            .some(roleId => roleIds.indexOf(roleId) > -1);
    },

    type: 'UnallocatedEntityCalculation'
};
