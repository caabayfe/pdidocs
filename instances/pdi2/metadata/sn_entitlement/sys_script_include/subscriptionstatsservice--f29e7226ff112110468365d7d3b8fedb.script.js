var SubscriptionStatsService = Class.create();
SubscriptionStatsService.prototype = {
    initialize: function() {
        this._subscriptionContext = null; // Get's new-ed up on first use of _getSubscriptionContext()
        this._contextFactory = new sn_entitlement.UnallocatedEntityCalculation_ContextFactory();
    },

    /**
     * Calculates the number of unallocated users that are associated with a subscription
     *
     * @param {CalculationSupplier} calculationSupplier An object that provides a user calculation stream and a group calculation stream.
     * @param {guid} subscriptionId The subscription id to calculate the stat for
     * @returns {number} A number 0 or greater representing the number of unallocated users
     */
    calculateUnallocatedUserCount: function(calculationSupplier, subscriptionId) {
        if (!calculationSupplier || !subscriptionId)
            return 0;

        return calculationSupplier.getUserCalculationStream()
            .filter(userData => !gs.nil(userData))
            .filter(userData => this._isEntityUnallocatedToSubscription(userData, subscriptionId))
            .reduce((acc, curr) => ++acc, 0);
    },

    /**
     * Returns the number of active users that are allocated to the subscription
     *
     * @param {guid} subscriptionId The subscription id to calculate the stat for
     * @returns {number} A number 0 or greater indicating the number of active users subscribed to this subscription
     */
    calculateAllocatedUserCount: function(subscriptionId) {
        // Somewhat counter-intuitively, the number of allocated users can not be calculated based
        // on a calculation supplier. Calculations are only run on users/groups that have at least
        // one role that requires a subscription. Since it is possible to allocate a user/group
        // that has no subscriptions, the mappings need to be counted not the calculation output.
        const subscriptionContext = this._getSubscriptionContext();
        return subscriptionId ?
            subscriptionContext.getUserCountBySubscriptionIdAndUserIsAllocatedAndActive(subscriptionId) :
            0;
    },

    /**
     * Returns the number of users that are allocated to 2+ subscriptions but could have
     * had all of their subscribable roles covered by a single subscription
     *
     * Note: This function assumes the user stream from the CalculationSupplier is the correct
     *    set of users / subscriptions to perform this calculation on. (e.g. this calculation does not make
     *    much sense on only one subscription)
     *
     * @param {CalculationSupplier} calculationSupplier An object that provides a user calculation stream and a group calculation stream.
     * @returns {number} A number 0 or greater indicating the number of users that match the criteria
     */
    calculateAllocatedUserMultiSubscriptionCount: function(calculationSupplier) {
        if (!calculationSupplier)
            return 0;

        return calculationSupplier.getUserCalculationStream()
            .filter(data => !gs.nil(data))
            .filter(data => this._hasMultipleSubscriptions(data))
            .filter(data => this._oneSubscriptionCoversAllSubscribeableRoles(data))
            .reduce((acc, curr) => ++acc, 0);
    },

    /**
     * Returns the number of users that are unallocated and have at least 2 subscriptions that could cover the same unallocated role
     *
     * Note: This function assumes the user stream from the CalculationSupplier is the correct
     *    set of users / subscriptions to perform this calculation on. (e.g. this calculation does not make
     *    much sense on only one subscription)
     *
     * @param {CalculationSupplier} calculationSupplier An object that provides a user calculation stream and a group calculation stream.
     * @returns {number} A number 0 or greater indicating the number of users that match the criteria
     */
    calculateUnallocatedUserMultiSubscriptionCount: function(calculationSupplier) {
        if (!calculationSupplier)
            return 0;

        return calculationSupplier.getUserCalculationStream()
            .filter(data => !gs.nil(data))
            .filter(data => this._hasMultipleUnallocatedSubscriptions(data))
            .filter(data => this._multipleSubscriptionsSatisfyAtLeastOneUnallocatedRole(data))
            .reduce((acc, curr) => ++acc, 0);
    },

    /**
     * Calculates the number of users that are allocated to the subscription and have a matching role for the subscription
     * 
     * @param {CalculationSupplier} calculationSupplier An object that provides a user calculation stream and a group calculation stream.
     * @param {guid} subscriptionId The subscription id to calculate the stat for
     * @returns {number} A number 0 or greater indicating the number of users that match the criteria
     */
    calculateAllocatedUsersWithALicensableRoleCount: function(calculationSupplier, subscriptionId) {
        if (!calculationSupplier || !subscriptionId)
            return 0;

        return calculationSupplier.getUserCalculationStream()
            .filter(data => !gs.nil(data))
            .filter(data => this._isEntityAllocatedToSubscription(data, subscriptionId))
            .filter(data => this._hasAMatchingRoleForSubscription(data, subscriptionId))
            .reduce((acc, curr) => ++acc, 0);
    },

    /**
     * Calculates the number of unallocated groups for the subscriptionDetailId
     *
     * @param {CalculationSupplier} calculationSupplier An object that provides a user calculation stream and a group calculation stream.
     * @param {guid} subscriptionId The subscription id to calculate the stat for
     * @returns {number} A number 0 or greater indicating the number of groups that match the criteria
     */
    calculateUnallocatedGroupCount: function(calculationSupplier, subscriptionId) {
        if (!calculationSupplier || !subscriptionId)
            return 0;

        return calculationSupplier.getGroupCalculationStream()
            .filter(data => !gs.nil(data))
            .filter(data => this._isEntityUnallocatedToSubscription(data, subscriptionId))
            .reduce((acc, curr) => ++acc, 0);
    },

    /**
     * Calculates the number of groups that have assigned roles belonging to the subscription
     *
     * @param {CalculationSupplier} calculationSupplier An object that provides a user calculation stream and a group calculation stream.
     * @param {guid} subscriptionId The subscription id to calculate the stat for
     * @returns {number} A number 0 or greater indicating the number of groups that match the criteria
     */
    calculateLicensableGroupCount: function(calculationSupplier, subscriptionId) {
        if (!calculationSupplier || !subscriptionId)
            return 0;

        return calculationSupplier.getGroupCalculationStream()
            .filter(data => !gs.nil(data))
            .filter(data => this._hasAMatchingRoleForSubscription(data, subscriptionId))
            .reduce((acc, curr) => ++acc, 0);
    },

    /**
     * Calculates the number of groups that have assigned roles belonging to the subscription
     *
     * @param {CalculationSupplier} calculationSupplier An object that provides a user calculation stream and a group calculation stream.
     * @param {guid} subscriptionId The subscription id to calculate the stat for
     * @returns {number} A number 0 or greater indicating the number of groups that match the criteria
     */
    calculateLicensableGroupSubscribedCount: function(calculationSupplier, subscriptionId) {
        if (!calculationSupplier || !subscriptionId)
            return 0;

        return calculationSupplier.getGroupCalculationStream()
            .filter(data => !gs.nil(data))
            .filter(data => this._isEntityAllocatedToSubscription(data, subscriptionId))
            .filter(data => this._hasAMatchingRoleForSubscription(data, subscriptionId))
            .reduce((acc, curr) => ++acc, 0);
    },

    /**
     * Calculates the number of users that have at least one licensable role and at least one subscription mapping
     * with a matching role
     *
     * @param {CalculationSupplier} calculationSupplier An object that provides a user calculation stream and a group calculation stream.
     * @returns {number} A number 0 or greater indicating the number of users that match the criteria
     */
    calculateUsersWithALicensableRoleAndSubscriptionCount: function(calculationSupplier) {
        if (!calculationSupplier)
            return 0;

        return calculationSupplier.getUserCalculationStream()
            .filter(data => !gs.nil(data))
            .filter(data => this._hasAtLeastOneSubscription(data))
            .filter(data => this._hasAtLeastOneLicensableRoleCoveredByASubscription(data))
            .reduce((acc, curr) => ++acc, 0);
    },

    /**
     * Calculates the number of users with at least one licensable role
     *
     * @param {CalculationSupplier} calculationSupplier An object that provides a user calculation stream and a group calculation stream.
     * @returns {number} A number 0 or greater indicating the number of users with a licensable role
     */
    calculateUsersWithALicensableRoleCount: function(calculationSupplier) {
        if (!calculationSupplier)
            return 0;

        return calculationSupplier.getUserCalculationStream()
            .filter(data => !gs.nil(data))
            .filter(data => this._hasAtLeastOneLicensableRole(data))
            .reduce((acc, curr) => ++acc, 0);
    },

    /**
     * Retrieves the subscriptionContext if it already exists, or creates a new one if it doesn't.
     */
    _getSubscriptionContext() {
        if (!this._subscriptionContext)
            this._subscriptionContext = this._contextFactory.createSubscriptionContext();
        return this._subscriptionContext;
    },

    /**
     * Determines if the user/group is allocated to the subscription
     *
     * @param {EntityAllocationData} data The user/group's allocation data object
     * @param {guid} subscriptionId The subscription to check if the user/group is allocated to
     * @returns {bool} True if the user/group is allocated to the subscription
     */
    _isEntityAllocatedToSubscription: function(data, subscriptionId) {
        return data.allocated_subscription_ids.indexOf(subscriptionId) >= 0;
    },

    /**
     * Determines if the user/group is unallocated to the subscription
     *
     * @param {EntityAllocationData} data The user/group's allocation data object
     * @param {guid} subscriptionId The subscription to check if the user/group is unallocated to
     * @returns {bool} True if the user/group is unallocated to the subscription
     */
    _isEntityUnallocatedToSubscription: function(data, subscriptionId) {
        return data.unallocated_subscription_ids.indexOf(subscriptionId) >= 0;
    },

    /**
     * Determines if the user/group has at least one licensable role
     *
     * @param {EntityAllocationData} allocationData The user/group's allocation data object
     * @returns {boolean} True if the user/group has at least one licensable role
     */
    _hasAtLeastOneLicensableRole: function(allocationData) {
        return allocationData.subscribeable_roles &&
            allocationData.subscribeable_roles.length > 0;
    },

    /**
     * Determines if at least one of the user/group's licensable roles matches up
     * with one of the user/group's subscription's
     *
     * @param {EntityAllocationData} data The user/group's allocation data object
     * @returns {bool} True if at least one role is properly subscribed
     */
    _hasAtLeastOneLicensableRoleCoveredByASubscription: function(allocationData) {
        return allocationData.allocated_subscription_ids
            .some(id => this._hasAMatchingRoleForSubscription(allocationData, id));
    },

    /**
     * Determines if the user has a role that matches one of the metered roles for the subscription
     * (e.g. the user needs the subscription)
     *
     * @param {EntityAllocationData} data The user's allocation data object
     * @param {guid} subscriptionId The subscription to check if the user is allocated to
     * @returns {bool} True if the user has at least one of the roles metered by the subscription
     */
    _hasAMatchingRoleForSubscription: function(data, subscriptionId) {
        const meteredRoleIds = this
            ._getSubscriptionContext()
            .getRoleIdsBySubscriptionIdAndRequiresASubscription(subscriptionId);

        return data.assigned_roles
            .some(roleId => meteredRoleIds.indexOf(roleId) >= 0);
    },

    /**
     * Determines if the user/group allocation data has 1+ allocated subscriptions
     *
     * @param allocationData user or group allocation data
     * @returns {boolean} True if the user/group has at least one allocated subscription
     */
    _hasAtLeastOneSubscription: function(allocationData) {
        return allocationData.allocated_subscription_ids && allocationData.allocated_subscription_ids.length > 0;
    },

    /**
     * Identifies if the user has multiple subscriptions
     *
     * @returns {bool} True if the user has 2+ subscriptions
     */
    _hasMultipleSubscriptions: function(userAllocationData) {
        return userAllocationData.allocated_subscription_ids.length > 1;
    },

    /**
     * Identifies if the user has multiple unallocated subscriptions
     *
     * @returns {bool} True if the user has 2+ unallocated subscriptions
     */
    _hasMultipleUnallocatedSubscriptions: function(userAllocationData) {
        return userAllocationData.unallocated_subscription_ids.length > 1;
    },

    /**
     * Identifies if there is a single subscription that will cover all of the subscribeable roles
     *
     * @returns {bool} True if there is at least one subscription that covers all roles
     */
    _oneSubscriptionCoversAllSubscribeableRoles: function(userAllocationData) {
        return this._getSubscriptionIdsByMeteredOnAllRoleIds(userAllocationData.subscribeable_roles).length > 0;
    },

    /**
     * Identifies if there is at least one unallocated role for the user that could be satisfied
     * by 2+ subscriptions
     *
     * @returns {bool} True when 2+ subsciptions can cover at least one of the user's unallocated roles
     */
    _multipleSubscriptionsSatisfyAtLeastOneUnallocatedRole: function(userAllocationData) {
        // Build a mapping of the unallocated subscriptions and their metered roles
        const unallocatedSubscriptionRoleMapping = {};
        userAllocationData.unallocated_subscription_ids
            .forEach(subscriptionId => {
                unallocatedSubscriptionRoleMapping[subscriptionId] = this
                    ._getSubscriptionContext()
                    .getRoleIdsBySubscriptionIdAndRequiresASubscription(subscriptionId);
            });

        // Calculate if any of the subscriptions have overlapping roles with the user's unsubscribed roles
        return userAllocationData.unsubscribed_roles
            .some(role =>
                Object.values(unallocatedSubscriptionRoleMapping)
                .filter(val => val.indexOf(role) >= 0)
                .reduce((acc, curr) => ++acc, 0) >= 2
            );
    },

    /**
     * Retrieves active subscriptions that cover all of the provided roles
     *
     * @param {array} roleIds An array of sys_user_role.sys_id values to find a subscription by
     * @returns {array} An array of subscription_entitlement.sys_id values
     */
    _getSubscriptionIdsByMeteredOnAllRoleIds: function(roleIds) {
        return this._getSubscriptionContext().getSubscriptionIdsByIsPerUser()
            .filter(subscriptionId => this._subscriptionIsMeteredByAllRoleIds(subscriptionId, roleIds));
    },

    /**
     * Identifies if a subscription is metered on all of the provided roleIds
     *
     * @param {guid} subscriptionId The subscription_entitlement.sys_id to check
     * @param {array} roleIds An array of sys_user_role.sys_id values to check for coverage on
     * @returns {bool} True if the subscription is metered on all of the provided roleIds
     */
    _subscriptionIsMeteredByAllRoleIds: function(subscriptionId, roleIds) {
        const meteredRoleIds = this._getSubscriptionContext()
            .getRoleIdsBySubscriptionIdAndRequiresASubscription(subscriptionId);

        return roleIds.every(roleId => meteredRoleIds.indexOf(roleId) >= 0);
    },

    /**
     * Calculates the number of tables mapped to a Subscription
     *
     * @param {guid} subscriptionId The subscription_entitlement/license_details sys_id used to calculate the stat
     * @returns {number} A number 0 or greater indicating the number of tables that are mapped to the subscription
     */
    getCustomTableAllocationCount: function(subscriptionId) {
        return this._getSubscriptionContext().getCustomTableAllocationCount(subscriptionId);
    },

    type: 'SubscriptionStatsService'
};
