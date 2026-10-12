var UserHasRoleInMemoryCache = Class.create();
UserHasRoleInMemoryCache.prototype = {
    /**
     * Create an in-memory cache of the data in sys_user_has_role limited to the roleIds that are provided
     * in this constructor.
     *
     * @param meteredRoleIds The super-set of roleIds to load into the in-memory cache
     * @param userBatch	The array of user IDs for the current batch being processed
     */
    initialize: function(meteredRoleIds, userBatch) {
        this._membershipInMemoryCache = this._constructInMemoryCache(meteredRoleIds, userBatch);
    },

    /**
     * Retrieve the roleIds assigned to the user
     *
     * @param userId The sys_user.sys_id to retrieve roles for
     * @returns {string[]} An array of sys_user_role.sys_id values
     */
    getRoleIdsByUserId: function(userId) {
        return this._membershipInMemoryCache.getValsById(userId);
    },

    /**
     * Setup the in-memory cache to hold the appropriate data
     *
     * @param meteredRoleIds The super-set of roleIds to load into the in-memory cache
     * @returns {sn_entitlement.MembershipInMemoryCache} A configured in-memory cache object
     * @private
     */
    _constructInMemoryCache: function(meteredRoleIds, userBatch) {
        const keyName = 'user';
        const valName = 'role';
        const userCount = userBatch.length;

        const gr = new GlideRecord(LicensingEngineConstants.SYS_USER_HAS_ROLE);
        gr.addQuery('role', 'IN', meteredRoleIds);
        gr.addQuery('user', 'IN', userBatch);
        gr.query();

        return new sn_entitlement.MembershipInMemoryCache(gr, keyName, valName, meteredRoleIds.length, userCount);
    },

    _getUserCount: function(meteredRoleIds) {
        const ga = new GlideAggregate(LicensingEngineConstants.SYS_USER_HAS_ROLE);
        ga.addQuery('role', 'IN', meteredRoleIds);
        ga.addQuery('user.active', true);
        ga.addAggregate(LicensingEngineConstants.DISTINCT_COUNT, 'user');
        ga.setGroup(false);
        ga.query();
        ga.next();
        return parseInt(ga.getAggregate(LicensingEngineConstants.DISTINCT_COUNT, 'user'));
    },

    type: 'UserHasRoleInMemoryCache'
};
