var SubscriptionStatsAccumulator = Class.create();
SubscriptionStatsAccumulator.prototype = {
    /**
     * Create a subscription stats accumulator that builds out the stats by recieving a single intermediate result
     * at a time, incrementally building up the stats.
     * 
     * @param subscriptionIds the subscriptionIds to create stats for
     */
    initialize: function(subscriptionIds) {
        this._subscriptionStatsService = new sn_entitlement.SubscriptionStatsService();

        this._instanceStats = this._createDefaultInstanceStats();
        this._subscriptionStats = {};

        subscriptionIds.forEach(subscriptionId => this._createSubscriptionStatsIfNotPresent(subscriptionId));
    },

    /**
     * Add an intermediate data point.
     *
     * @param data A single intermediate result from the unallocated calculation output for a user
     */
    addUserData: function(data) {
        this._updateStats(data, null);
    },

    /**
     * Add an intermediate data point.
     *
     * @param data A single intermediate result from the unallocated calculation output for a group
     */
    addGroupData: function(data) {
        this._updateStats(null, data);
    },

    /**
     * Retrieves AllocatedUserMultiSubscriptionCount
     *
     * @returns {Integer} A value 0 or greater
     */
    getAllocatedUserMultiSubscriptionCount: function() {
        return this._instanceStats.allocatedUserMultiSubscriptionCount;
    },

    /**
     * Retrieves UnallocatedUserMultiSubscriptionCount
     *
     * @returns {Integer} A value 0 or greater
     */
    getUnallocatedUserMultiSubscriptionCount: function() {
        return this._instanceStats.unallocatedUserMultiSubscriptionCount;
    },

    /**
     * Retrieves UsersWithALicensableRoleAndSubscriptionCount
     *
     * @returns {Integer} A value 0 or greater
     */
    getUsersWithALicensableRoleAndSubscriptionCount: function() {
        return this._instanceStats.usersWithALicensableRoleAndSubscriptionCount;
    },

    /**
     * Retrieves UsersWithALicensableRoleCount
     *
     * @returns {Integer} A value 0 or greater
     */
    getUsersWithALicensableRoleCount: function() {
        return this._instanceStats.usersWithALicensableRoleCount;
    },

    /**
     * Retrieves UnallocatedUserCount
     *
     * @param subscriptionId The subscriptionId to retrieve the stat for
     * @returns {Integer} A value 0 or greater
     */
    getUnallocatedUserCount: function(subscriptionId) {
        return this._getSubscriptionStat(subscriptionId, 'unallocatedUserCount');
    },

    /**
     * Retrieves AllocatedUserCount
     *
     * @param subscriptionId The subscriptionId to retrieve the stat for
     * @returns {Integer} A value 0 or greater
     */
    getAllocatedUserCount: function(subscriptionId) {
        // Calculating this on request as it doesn't need to be accumulated via supplier data
        return this._subscriptionStatsService.calculateAllocatedUserCount(subscriptionId);
    },

    /**
     * Retrieves AllocatedUsersWithoutLicensableRoleCount
     *
     * @param subscriptionId The subscriptionId to retrieve the stat for
     * @returns {Integer} A value 0 or greater
     */
    getAllocatedUsersWithoutLicensableRoleCount: function(subscriptionId) {
        // Note: Due to the output of the unallocated calculation only including users with a licensable role
        //    this stat needs to consider data outside of the individual records this class will pass to it
        //    this throws off the calculation if everything is done in one function. So instead the inverse
        //    is calculated in the stats service and the difference between allocated and properly allocated is calculated
        //    here in this function at time of retrieval.

        const allocatedUserCount = this.getAllocatedUserCount(subscriptionId);
        const allocatedUsersWithLicensableRoleCount = this._getSubscriptionStat(subscriptionId, 'allocatedUsersWithLicensableRoleCount');
        return allocatedUserCount - allocatedUsersWithLicensableRoleCount;
    },

    /**
     * Retrieves UnallocatedGroupCount
     *
     * @param subscriptionId The subscriptionId to retrieve the stat for
     * @returns {Integer} A value 0 or greater
     */
    getUnallocatedGroupCount: function(subscriptionId) {
        return this._getSubscriptionStat(subscriptionId, 'unallocatedGroupCount');
    },

    /**
     * Retrieves LicensableGroupCount
     *
     * @param subscriptionId The subscriptionId to retrieve the stat for
     * @returns {Integer} A value 0 or greater
     */
    getLicensableGroupCount: function(subscriptionId) {
        return this._getSubscriptionStat(subscriptionId, 'licensableGroupCount');
    },

    /**
     * Retrieves LicensableGroupSubscribedCount
     *
     * @param subscriptionId The subscriptionId to retrieve the stat for
     * @returns {Integer} A value 0 or greater
     */
    getLicensableGroupSubscribedCount: function(subscriptionId) {
        return this._getSubscriptionStat(subscriptionId, 'licensableGroupSubscribedCount');
    },

    /**
     * Creates the default instance stats object
     *
     * @returns {Object} A default instance stats model
     */
    _createDefaultInstanceStats: function() {
        return {
            allocatedUserMultiSubscriptionCount: 0,
            unallocatedUserMultiSubscriptionCount: 0,
            usersWithALicensableRoleAndSubscriptionCount: 0,
            usersWithALicensableRoleCount: 0
        };
    },

    /**
     * Creates the a default subscription stats object
     *
     * @returns {Object} A default subscription stats model
     */
    _createDefaultSubscriptionStats: function() {
        return {
            unallocatedUserCount: 0,
            allocatedUsersWithLicensableRoleCount: 0,
            unallocatedGroupCount: 0,
            licensableGroupCount: 0,
            licensableGroupSubscribedCount: 0,
        };
    },

    /**
     * Creates the default subscription stats object if one does not exist for this subscriptionId
     *
     * @param subscriptionId The subscriptionId to create stats for
     */
    _createSubscriptionStatsIfNotPresent: function(subscriptionId) {
        if (!Object.keys(this._subscriptionStats).includes(subscriptionId))
            this._subscriptionStats[subscriptionId] = this._createDefaultSubscriptionStats();
    },

    /**
     * Convenience method to return 0 if a subscription is requested that there are no stats for
     *
     * @param subscriptionId
     * @param statName
     * @returns {number|*}
     * @private
     */
    _getSubscriptionStat: function(subscriptionId, statName) {
        return this._subscriptionStats[subscriptionId] ?
            this._subscriptionStats[subscriptionId][statName] :
            0;
    },

    /**
     * Creates a supplier based on the provided user and/or group data
     *
     * @param userData User allocation data record
     * @param groupData Group allocation data record
     * @returns {CalculationSupplier} A calculation supplier that returns the provided record(s)
     */
    _createSupplier: function(userData, groupData) {
        const userDataArray = userData ? [userData] : [];
        const groupDataArray = groupData ? [groupData] : [];

        return {
            getUserCalculationStream: function() {
                return global.Stream.fromArray(userDataArray);
            },

            getGroupCalculationStream: function() {
                return global.Stream.fromArray(groupDataArray);
            }
        };
    },

    /**
     * Update the accumulated stats based on the calculationSuppier
     *
     * @param calculationSupplier
     */
    _updateStats: function(userData, groupData) {
        // Note: Intentionally skipping calculateAllocatedUserCount(subscriptionId) until the stat is requested as
        //    the data in the supplier is not used, and it would be wasteful to run the query each time a new supplier
        //    is provided.

        // Each of the stats calculations will end up producing 0 or 1 as a result of each of the suppliers having only
        // one record. So the sum of all the individual records should be the same as if a stream of all of the
        // records was provided to these functions.

        // Convenience method to reduce the amount of repetition for the following code
        const supplier = () => this._createSupplier(userData, groupData);

        // Update subscription stats
        Object.keys(this._subscriptionStats).forEach((subscriptionId) => {
            this._subscriptionStats[subscriptionId].unallocatedUserCount += this._subscriptionStatsService.calculateUnallocatedUserCount(supplier(), subscriptionId);
            this._subscriptionStats[subscriptionId].allocatedUsersWithLicensableRoleCount += this._subscriptionStatsService.calculateAllocatedUsersWithALicensableRoleCount(supplier(), subscriptionId);
            this._subscriptionStats[subscriptionId].unallocatedGroupCount += this._subscriptionStatsService.calculateUnallocatedGroupCount(supplier(), subscriptionId);
            this._subscriptionStats[subscriptionId].licensableGroupCount += this._subscriptionStatsService.calculateLicensableGroupCount(supplier(), subscriptionId);
            this._subscriptionStats[subscriptionId].licensableGroupSubscribedCount += this._subscriptionStatsService.calculateLicensableGroupSubscribedCount(supplier(), subscriptionId);
        });

        // Update instance stats
        this._instanceStats.allocatedUserMultiSubscriptionCount += this._subscriptionStatsService.calculateAllocatedUserMultiSubscriptionCount(supplier());
        this._instanceStats.unallocatedUserMultiSubscriptionCount += this._subscriptionStatsService.calculateUnallocatedUserMultiSubscriptionCount(supplier());
        this._instanceStats.usersWithALicensableRoleAndSubscriptionCount += this._subscriptionStatsService.calculateUsersWithALicensableRoleAndSubscriptionCount(supplier());
        this._instanceStats.usersWithALicensableRoleCount += this._subscriptionStatsService.calculateUsersWithALicensableRoleCount(supplier());
    },

    type: 'SubscriptionStatsAccumulator'
};
