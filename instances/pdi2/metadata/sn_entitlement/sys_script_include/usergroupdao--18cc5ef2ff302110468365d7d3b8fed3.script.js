var UserGroupDao = Class.create();
UserGroupDao.prototype = {
    initialize: function() {},
    /**
     * Retrieves the sys_user_group.sys_id values for all active groups
     *
     * @returns {array} An array of sys_user_group.sys_id values
     */
    getUserGroupIdsByActive: function() {
        const gr = new GlideRecord('sys_user_group');
        gr.addQuery('active', true);
        gr.query();
        let ids = [];
        while (gr.next())
            ids.push(gr.getUniqueValue());
        return ids;
    },

    /**
     * Checks to see if the group is active and returns a boolean indicating if it is or not
     *
     * @param {guid} groupId the sys_user_group.sys_id to check
     * @returns {bool} True if the group exists and is active
     */
    getGroupIdIsActive: function(groupId) {
        const gr = new GlideRecord('sys_user_group');
        gr.addQuery('sys_id', groupId);
        gr.addQuery('active', true);
        gr.query();

        return gr.hasNext();
    },

    /**
     * Retrieves the sys_user_group.sys_id values for all active groups that also have at least 
     * one of the roles provided.
     *
     * @param {array} roleIds An array of sys_user_role.sys_id values to filter groups down
     * @returns {array} An array of sys_user_group.sys_id values
     */
    getGroupIdsByActiveAndHasRole: function(roleIds) {
        const gr = new GlideRecord('sys_group_has_role');
        this._addGroupIdsByActiveAndHasRoleFilters(gr, roleIds);
        gr.query();

        const ids = new Set();
        while (gr.next())
            ids.add(String(gr.group.sys_id));
        return Array.from(ids);
    },

    /**
     * Retrieves the sys_user_group.sys_id count for all active groups that also have at least 
     * one of the roles provided.
     *
     * @param {array} roleIds An array of sys_user_role.sys_id values to filter groups down
     * @returns {int} The number of groupIds that matched
     */
    getGroupIdsCountByActiveAndHasRole: function(roleIds) {
        const ga = new GlideAggregate('sys_group_has_role');
        ga.groupBy('group');
        this._addGroupIdsByActiveAndHasRoleFilters(ga, roleIds);
        ga.query();

        return ga.getRowCount();
    },

    _addGroupIdsByActiveAndHasRoleFilters: function(gr, roleIds) {
        gr.addQuery('group.active', true);
        gr.addQuery('role.sys_id', 'IN', roleIds);
    },

    type: 'UserGroupDao'
};
