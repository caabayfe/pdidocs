var RoleInfoProvider = Class.create();
RoleInfoProvider.prototype = {
    initialize: function() {
        // stored value for Synced in license_role_discovered
        this.SYNCED = 1;
    },

    /**
     * Given the scope of a custom application, return the roles which were discovered by role analysis
     *
     * @param {string} scope is the name of the scope in sys_scope.scope
     * @return {array} an array of objects with information about roles
     * {
     *    sys_id : "sys_id of sys_user_role",
     *    name: "name from sys_user_role",
     *    role_type: "id stored in license_role_type.id",
     *    reason: "translated text from reason",
     *    license_family_id: "application which role gives access to, as id from license_family.family_id which can be 'unknown' (valid record) if there's no associated licensable application",
     *    scope: "application which role gives access to, as scope from sys_scope.scope"
     * }
     *
     */
    getDiscoveredRolesForCustomApp: function(scope) {
        return this._queryDiscoveredRolesWithConditionOnUserRole('sys_scope.scope', scope);
    },

    /**
     * Given the source of custom applications as the IDE in which they were created, return the roles
     * which were discovered by role analysis
     * 
     * @param {string} ide an identifier for the IDE stored in sys_package.ide_created
     * @return {array} an array of objects with information about roles
     * {
     *    sys_id : "sys_id of sys_user_role",
     *    name: "name from sys_user_role",
     *    role_type: "id stored in license_role_type.id",
     *    reason: "translated text from reason",
     *    license_family_id: "application which role gives access to, as id from license_family.family_id which can be 'unknown' (valid record) if there's no associated licensable application",
     *    scope: "application which role gives access to, as scope from sys_scope.scope"
     * }
     */
    getDiscoveredRolesForIDECustomApps: function(ide) {
        return this._queryDiscoveredRolesWithConditionOnUserRole('sys_scope.ide_created', ide);
    },

    _queryDiscoveredRolesWithConditionOnUserRole: function(userRoleColumn, userRoleValue) {
        // IMPLEMENTATION notes - couple of different options
        // GlideAggregate - doesn't have addJoinQuery support
        // Related list query license_role_discovered.sys_user_role stores the name field, so can't do sys_id based join
        // GlideRecord - roles can be duplicated (API to set "distinct" is not exposed)
        // GlideRecord is what is used here

        const gr = new GlideRecord('license_role_discovered');
        // query only Synced records
        gr.addQuery('state', this.SYNCED);

        // the reference field sys_user_role stores sys_user_role.name
        const joinQueryCondition = gr.addJoinQuery('sys_user_role', 'sys_user_role', 'name');
        joinQueryCondition.addCondition(userRoleColumn, userRoleValue);

        gr.query();

        return this._collectRoleInfo(gr);
    },

    _collectRoleInfo: function(gr) {
        const roleInfos = [];
        while (gr.next()) {
            roleInfos.push(this._mapToRoleInfo(gr));
        }

        return roleInfos;
    },

    _mapToRoleInfo: function(gr) {
        const scope = gs.nil(gr.scope.toString()) ? 'global' : gr.scope.scope.toString();
        return {
            'sys_id': gr.sys_user_role.sys_id.toString(),
            'name': gr.sys_user_role.toString(),
            'role_type': gr.license_role_type.toString(),
            'reason': gr.reason.getDisplayValue(),
            'license_family_id': gr.application.toString(),
            'scope': scope
        }
    },

    type: 'RoleInfoProvider'
};
