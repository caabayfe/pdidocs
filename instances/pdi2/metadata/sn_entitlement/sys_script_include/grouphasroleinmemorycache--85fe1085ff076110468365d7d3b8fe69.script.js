var GroupHasRoleInMemoryCache = Class.create();
GroupHasRoleInMemoryCache.prototype = {
    /**
     * Create an in-memory cache of the data in sys_group_has_role limited to the roleIds that are provided
     * in this constructor.
     *
     * @param meteredRoleIds The super-set of roleIds to load into the in-memory cache
     */
    initialize: function(meteredRoleIds) {
        this._membershipInMemoryCache = this._constructInMemoryCache(meteredRoleIds);
    },

    /**
     * Retrieve the roleIds assigned to the group
     *
     * @param groupId The sys_user_group.sys_id to retrieve roles for
     * @returns {string[]} An array of sys_user_role.sys_id values
     */
    getRoleIdsByGroupId: function(groupId) {
        return this._membershipInMemoryCache.getValsById(groupId);
    },

    /**
     * Setup the in-memory cache to hold the appropriate data
     *
     * @param meteredRoleIds The super-set of roleIds to load into the in-memory cache
     * @returns {sn_entitlement.MembershipInMemoryCache} A configured in-memory cache object
     * @private
     */
    _constructInMemoryCache: function(meteredRoleIds) {
        const keyName = 'group';
        const valName = 'role';
        const groupCount = this._getGroupCount(meteredRoleIds);

        const gr = new GlideRecord(LicensingEngineConstants.SYS_GROUP_HAS_ROLE);
        gr.addQuery('role', 'IN', meteredRoleIds);
        gr.addQuery('group.active', true);
        gr.query();

        return new sn_entitlement.MembershipInMemoryCache(gr, keyName, valName, meteredRoleIds.length, groupCount);
    },

    _getGroupCount: function(meteredRoleIds) {
        const ga = new GlideAggregate(LicensingEngineConstants.SYS_GROUP_HAS_ROLE);
        ga.addQuery('role', 'IN', meteredRoleIds);
        ga.addQuery('group.active', true);
        ga.addAggregate(LicensingEngineConstants.DISTINCT_COUNT, 'group');
        ga.setGroup(false);
        ga.query();
        ga.next();
        return parseInt(ga.getAggregate(LicensingEngineConstants.DISTINCT_COUNT, 'group'));
    },

    type: 'GroupHasRoleInMemoryCache'
};
