/**
 * Data access functions that return a single or many userIds (sys_user.sys_id)
 */
var UserDao = Class.create();
UserDao.prototype = {
    initialize: function() {},

    /**
     * Checks to see if the user is active and returns a boolean indicating if it is or not
     *
     * @param {guid} userId the sys_user.sys_id to check
     * @returns {bool} True if the user exists and is active
     */
    getUserIdIsActive: function(userId) {
        const gr = new GlideRecord('sys_user');
        gr.addQuery('sys_id', userId);
        gr.addQuery('active', true);
        gr.query();

        return gr.hasNext();
    },

    /**
     * Retieves the sys_user.sys_id values for all valid users that also have at least 
     * one of the roles provided.
     *
     * @param {array} roleIds An array of sys_user_role.sys_id values to filter users down
     * @returns {array} An array of sys_user.sys_id values
     */
    getUserIdsByValidAndHasRole: function(roleIds) {
        const gr = new GlideRecord('sys_user_has_role');
        this._addUserIdsByValidAndHasRoleFilters(gr, roleIds);
        gr.query();

        let ids = new Set();
        while (gr.next())
            ids.add(String(gr.user));
        return Array.from(ids);
    },

    /**
     * Retrieves the number of usersIds that are valid and have at least one of the roles
     * provided.
     * 
     * @param {array} roleIds An array of sys_user_role.sys_id values to filter users down
     * @returns {int} The number of userIds that matched
     */
    getUserIdsCountByValidAndHasRole: function(roleIds) {
        const ga = new GlideAggregate('sys_user_has_role');
        ga.groupBy('user');
        this._addUserIdsByValidAndHasRoleFilters(ga, roleIds);
        ga.query();
        return ga.getRowCount();
    },

    _addUserIdsByValidAndHasRoleFilters: function(gr, roleIds) {
        this._addValidFilter(gr);
        gr.addQuery('role', 'IN', roleIds);
    },

    /**
     * Retrieves the valid user ids that belong to at least one of the groupIds provided
     * 
     * @param {array} groupIds An array of sys_user_group.sys_id values to filter users by
     * @returns {array} An array of sys_user.sys_id values
     */
    getUserIdsByValidAndIsAMemberOfOneOfTheGroups: function(groupIds) {
        const gr = new GlideRecord('sys_user_grmember');
        this._addValidFilter(gr);
        gr.addQuery('group', 'IN', groupIds);
        gr.query();

        const ids = new Set();
        while (gr.next())
            ids.add(String(gr.user));
        return [...ids];
    },

    getActiveGroupMembersCountByGroupIDs: function(groupIds) {
        const counts = new Map();

        if (groupIds.length === 0)
            return counts;

        const grmembers = new GlideAggregate('sys_user_grmember');
        grmembers.addQuery('group', "IN", groupIds);
        this._addValidFilter(grmembers);
        grmembers.addAggregate('COUNT', "group");
        grmembers.query();
        while (grmembers.next()) {
            counts.set(grmembers.getValue("group"), grmembers.getAggregate("COUNT", "group"));
        }

        return counts;
    },


    _addValidFilter: function(gr) {
        this._addUserValidityFilter(gr, "user");
    },

    _addUserValidityFilter: function(gr, dotWalkTo) {
        new LicensingEngineCommonUtil().addSysUserActiveFilter(gr, dotWalkTo);
    },

    /**
     * Looks up user by their sys_id
     * 
     * @param {array} userIds list of user sys_ids
     * @returns GlideRecord of sys_user
     */
    getUserRecordsForIds: function(userIds, additionalQuery) {
        if (userIds.length === 0) {
            return new GlideRecord("sys_user");
        }

        let gr = new GlideRecord("sys_user");
        this._addUserValidityFilter(gr, "");
        gr.addEncodedQuery(GlideStringUtil.escapeQueryTermSeparator(additionalQuery), true);
        gr.addQuery("sys_id", "IN", userIds.join(","));
        gr.query();
        return gr;
    },

    type: 'UserDao'
};
