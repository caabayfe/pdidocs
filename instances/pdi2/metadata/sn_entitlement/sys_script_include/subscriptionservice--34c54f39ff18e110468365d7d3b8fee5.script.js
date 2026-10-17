/**
 * Functions that calculate the derived values for subscriptions (e.g. unallocated users, unallocated groups, stats, etc)
 */
var SubscriptionService = Class.create();
SubscriptionService.prototype = {
    /**
     * @param {bool} oobRolesOnly A boolean flag that filters the roles to out-of-box roles when true.
     */
    initialize: function(oobRolesOnly = false) {
        this._oobRolesOnly = oobRolesOnly;

        this._logSourceName = `sn_entitlement.${this.type}`;

        this._userDao = new sn_entitlement.UserDao();
        this._userGroupDao = new sn_entitlement.UserGroupDao();
        this._contextFactory = new sn_entitlement.UnallocatedEntityCalculation_ContextFactory(oobRolesOnly);
        this._allocationService = new sn_entitlement.AllocationDataService();
    },

    /**
     * Calculates all of the unallocated users for each active subscription
     *
     * @param {object}	an object map of subscription_entitlement sysids to subscription_detail sysids
     * @param {array}	Array of subscription IDs
     * @returns {SubscriptionStatsAccumulator}	An object holding subscription stats
     */
    calculateUnallocatedUsersByAllSubscriptions: function(map, subscriptionIds) {
        // Note: For performance reasons, it is better to calculate the global set of unallocated users
        //    and then determine which subscriptions they are unallocated for than calling the
        //    getUnallocatedUsersBySubscriptionId(subscriptionId) as it has to calculate the unallocation
        //    data for all users on each call.

        const stats = new sn_entitlement.SubscriptionStatsAccumulator(subscriptionIds);
        const userIds = this._getUserIdsThatHaveARoleThatRequiresASubscription();
        return this.calculateUnallocatedUserByUserIds(userIds, map, stats);
    },

    /**
     * Calculates the unallocated users within the list of userIds provided
     *
     * @param {array} An array of sys_user.sys_id values to process
     * @param {object}	an object map of subscription_entitlement sysids to subscription_detail sysids
     * @param {SubscriptionStatsAccumulator}	(optional) An object holding subscription stats
     * @returns {SubscriptionStatsAccumulator}	An object holding subscription stats
     */
    calculateUnallocatedUserByUserIds: function(userIds, map, stats) {
        const subscriptionContext = this._contextFactory.createSubscriptionContext();
        const numUsers = userIds.length;
        const batchSize = parseInt(gs.getProperty(LicensingEngineConstants.PROP_UNCONFIRMEDCALCULATION_USER_BATCH_SIZE, LicensingEngineConstants.UNCONFIRMEDCALCULATION_DEFAULT_USER_BATCH_SIZE));

        gs.info(`${this._logSourceName}: Calculating unallocated status for ${numUsers} users`);

        for (let i = 0; i < numUsers; i += batchSize) {
            //For the final batch, JavaScript will automatically extract the elements until the end of the array
            const userBatch = userIds.slice(i, i + batchSize);
            try {
                const batchResult = global.Stream.fromArray(userBatch)
                    .map(userId => this._contextFactory.createUserContext(userId, subscriptionContext, userBatch))
                    .map(userContext => new sn_entitlement.UnallocatedEntityCalculation(subscriptionContext, userContext))
                    .map(calculation => calculation.calculateUnallocatedData())
                    .filter(calculation => this._hasAnAllocatedOrUnallocatedSubscriptionReference(calculation));

                batchResult.forEach(user => {
                    this._allocationService.persistUserAllocationData(map, user);
                    if (stats)
                        stats.addUserData(user);
                });
            } catch (err) {
                gs.error(`${this._logSourceName}: Error processing batch [${i} - ${i + batchSize - 1}] of user IDs for unconfirmed calculation: ${err.message}`);
            }

            this._contextFactory.resetUserHasRoleInMemoryCache();
        }

        return stats;
    },

    /**
     * Retrieves an array of objects containing all of the unallocated groups for each active subscription
     *
     * @returns {stream} A stream of objects that contain the unallocated groups per subscription
     */
    getUnallocatedGroupCalculationsByAllSubscriptions: function() {
        const groupIds = this._getGroupIdsThatHaveARoleThatRequiresASubscription();
        return this.getUnallocatedGroupCalculationsByGroupIds(groupIds);
    },

    /**
     * Retrieves an array of objects containing the unallocated groups within the list of groupIds provided
     *
     * @param {array} An array of sys_user_group.sys_id values to process
     * @returns {stream} A Stream of objects that contain the unallocated groups provided in the groupIds list
     */
    getUnallocatedGroupCalculationsByGroupIds: function(groupIds) {
        const subscriptionContext = this._contextFactory.createSubscriptionContext();

        gs.info(`${this._logSourceName}: Calculating unallocated status for ${groupIds.length} groups`);

        return global.Stream.fromArray(groupIds)
            .map(groupId => this._contextFactory.createGroupContext(groupId, subscriptionContext))
            .map(groupContext => new sn_entitlement.UnallocatedEntityCalculation(subscriptionContext, groupContext))
            .map(calculation => calculation.calculateUnallocatedData())
            .filter(calculation => this._hasAnAllocatedOrUnallocatedSubscriptionReference(calculation));
    },

    /**
     * Retrieves the number of users the subscription service will process when calling getUnallocatedUserCalculationsByAllSubscriptions()
     */
    getUserCountByNeedsToBeProcessed: function() {
        const roleIdsThatRequireASubscription = this._getRoleIdsThatRequireASubscription();
        return this._userDao.getUserIdsCountByValidAndHasRole(roleIdsThatRequireASubscription);
    },

    /**
     * Retrieves the number of groups the subscription service will process when calling getUnallocatedGroupCalculationsByAllSubscriptions()
     */
    getGroupCountByNeedsToBeProcessed: function() {
        const roleIdsThatRequireASubscription = this._getRoleIdsThatRequireASubscription();
        return this._userGroupDao.getGroupIdsCountByActiveAndHasRole(roleIdsThatRequireASubscription);
    },

    /**
     * Determines if the calculation results in at least one allocated or unallocated subscription.
     * In normal scenarios, it is expected that unallocated calculations will always result in at least
     * one subscription mapping (either allocated or unallocated) since a licensable role requires a subscription
     * however, with the special cases of UU and Module behavior, we may process a user that has 100% of
     * their licensable roles fulfilled by UU and/or Module and thus not produce a subscription relationship.
     * These users/groups should be ignored.
     */
    _hasAnAllocatedOrUnallocatedSubscriptionReference: function(entityAllocationData) {
        return entityAllocationData &&
            (entityAllocationData.allocated_subscription_ids && entityAllocationData.allocated_subscription_ids.length > 0 ||
                entityAllocationData.unallocated_subscription_ids && entityAllocationData.unallocated_subscription_ids.length > 0);
    },

    /**
     * Retrieves an array of user ids (sys_user.sys_id) that have at least one role that requires
     * a subscription.
     *
     * @returns {array} An array of sys_user.sys_id values
     */
    _getUserIdsThatHaveARoleThatRequiresASubscription: function() {
        const roleIdsThatRequireASubscription = this._getRoleIdsThatRequireASubscription();

        gs.info(`${this._logSourceName}: ${roleIdsThatRequireASubscription.length} metered roleIds detected`);

        return this._userDao.getUserIdsByValidAndHasRole(roleIdsThatRequireASubscription);
    },

    /**
     * Retrieves an array of group ids (sys_user_group.sys_id) that have at least one role that requires a subscription
     *
     * @returns {array} An array of sys_user_role.sys_id values
     */
    _getGroupIdsThatHaveARoleThatRequiresASubscription: function() {
        const roleIdsThatRequireASubscription = this._getRoleIdsThatRequireASubscription();

        gs.info(`${this._logSourceName}: ${roleIdsThatRequireASubscription.length} metered roleIds detected`);

        return this._userGroupDao.getGroupIdsByActiveAndHasRole(roleIdsThatRequireASubscription);
    },

    _getRoleIdsThatRequireASubscription: function() {
        return this._contextFactory
            .createSubscriptionContext()
            .getRoleIdsByRequiresASubscription();
    },

    type: 'SubscriptionService'
};
