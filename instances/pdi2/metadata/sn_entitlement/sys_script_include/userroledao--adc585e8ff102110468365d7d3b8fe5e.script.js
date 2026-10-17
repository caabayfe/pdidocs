/**
 * Data access functions that return a single or many roleIds (sys_user_role.sys_id)
 */
var UserRoleDao = Class.create();
UserRoleDao.prototype = {
    initialize: function() {
        this._licenseFamilyDao = new sn_entitlement.LicenseFamilyDao();
        this._grHelper = new sn_entitlement.LicensingEngineGlideRecordHelper();
    },

    /**
     * Retrieves the roleIds (sys_ids) associated to the subscriptionId (subscription_entitlement.sys_id) provided
     * filtered down to just the license_role_type.sys_id values provided
     *
     * @param {guid} subscriptionId The subscription_entitlement.sys_id to filter the sys_user_role records by
     * @param {array} licenseRoleTypeNames The license_role_type.name values to limit the results by
     * @param {bool} oobRolesOnly A boolean flag that filters the roles to out-of-box roles when true.
     * @return {array} An array of sys_user_role.sys_id values
     */
    getUserRoleIdsBySubscriptionIdAndLicenseRoleTypeNames: function(subscriptionId, licenseRoleTypeNames, oobRolesOnly) {
        if (licenseRoleTypeNames.length === 0)
            return [];
        const licenseFamilyIds = this._licenseFamilyDao.getLicenseFamilyIdsBySubscriptionId(subscriptionId);
        if (licenseFamilyIds.length === 0)
            return [];
        const licensableRoleNames = this._getUserRoleNamesByLicenseFamilyIdsAndLicenseRoleTypeNames(licenseFamilyIds, licenseRoleTypeNames, oobRolesOnly);
        if (licensableRoleNames.length === 0)
            return [];

        const gr = new GlideRecord('sys_user_role');
        gr.addQuery('name', 'IN', licensableRoleNames); //Note: Had to query by name since that is what is referenced in the DB view
        gr.query();

        let ids = [];
        while (gr.next())
            ids.push(gr.getUniqueValue());
        return ids;
    },

    /**
     * Retrieves the sys_user_role.name values that belong to the identified license family ids with matching
     * license role type name.
     *
     * @param {array} licenseFamilyIds The license_family.sys_id values to filter by
     * @param {array} licenseRoleTypeNames The role type names to filter by
     * @param {bool} oobRolesOnly A boolean flag that filters the roles to out-of-box roles when true.
     * @returns {array} An array of role names (the reference to sys_user_role is by name instead of by id)
     */
    _getUserRoleNamesByLicenseFamilyIdsAndLicenseRoleTypeNames: function(licenseFamilyIds, licenseRoleTypeNames, oobRolesOnly) {
        if ((licenseFamilyIds.length === 0) || (licenseRoleTypeNames.length === 0))
            return [];

        const gr = new GlideRecord('license_role');
        gr.addQuery('application.sys_id', 'IN', licenseFamilyIds);
        gr.addQuery('license_role_type', 'IN', licenseRoleTypeNames);

        if (oobRolesOnly)
            gr.addQuery('category', 0); // 0 is the value for "ServiceNow OOB"; 1 is the value for "Custom"

        gr.query();

        const names = new Set();
        while (gr.next())
            names.add(String(gr.sys_user_role));
        return Array.from(names);
    },

    /**
     * Retrieves the sys_user_role.name values that belong to the identified license family ids with matching
     * license role type name.
     *
     * @param {array} licenseFamilyIds The license_family.sys_id values to filter by
     * @param {array} licenseRoleTypeNames The role type names to filter by
     * @param {bool} oobRolesOnly A boolean flag that filters the roles to out-of-box roles when true.
     * @returns {map} Map of licenseFamilyId to role names (the reference to sys_user_role is by name instead of by id)
     */
    getLicensableUserRoleNamesByLicenseRoleTypeNamesForLicenseFamilyIds: function(licenseFamilyIds, licenseRoleTypeNames, oobRolesOnly) {
        if ((licenseFamilyIds.length === 0) || (licenseRoleTypeNames.length === 0))
            return [];

        const gr = new GlideRecord('license_role');
        gr.addQuery('application.sys_id', 'IN', licenseFamilyIds);
        gr.addQuery('license_role_type', 'IN', licenseRoleTypeNames);
        this._grHelper.addExtraField(gr, "application.sys_id");
        if (oobRolesOnly)
            gr.addQuery('category', 0); // 0 is the value for "ServiceNow OOB"; 1 is the value for "Custom"

        gr.query();

        const licFamToNames = new Map();
        while (gr.next()) {
            const licFamId = gr.application.sys_id.toString();
            const names = licFamToNames.get(licFamId) ?? new Set();
            names.add(String(gr.sys_user_role));
            licFamToNames.set(licFamId, names);
        }

        const resultMap = new Map();
        licFamToNames.forEach((value, key) => {
            resultMap.set(key, Array.from(value));
        });

        return resultMap;
    },

    /**
     * Retrieves all role IDs associated with the subscription identified even if the role is not
     * a metered role for the subscription
     *
     * @param {guid} subscriptionId The subscription ID to get roles for
     * @param {bool} oobRolesOnly A flag that indicates if only out-of-box roles should be retrieved (when true) or all roles (when false)
     * @returns {array} An array of role IDs associated with the subscription
     */
    getRoleIdsBySubscriptionId: function(subscriptionId, oobRolesOnly) {
        const licenseFamilyIds = this._licenseFamilyDao.getLicenseFamilyIdsBySubscriptionId(subscriptionId);
        if (licenseFamilyIds.length === 0)
            return [];

        const roleNames = this._getUserRoleNamesByLicenseFamilyIds(licenseFamilyIds, oobRolesOnly);
        if (roleNames.length === 0)
            return [];

        const gr = new GlideRecord('sys_user_role');
        gr.addQuery('name', 'IN', roleNames);
        gr.query();

        let ids = [];
        while (gr.next())
            ids.push(gr.getUniqueValue());
        return ids;
    },

    /**
     * Retrieves the sys_user_role.name values that belong to the identified license family ids
     *
     * @param {array} licenseFamilyIds The license_family.sys_id values to filter by
     * @param {bool} oobRolesOnly A boolean flag that filters the roles to out-of-box roles when true.
     * @returns {array} An array of role names (the reference to sys_user_role is by name instead of by id)
     */
    _getUserRoleNamesByLicenseFamilyIds: function(licenseFamilyIds, oobRolesOnly) {
        if (licenseFamilyIds.length === 0)
            return [];

        const gr = new GlideRecord('license_role');
        gr.addQuery('application.sys_id', 'IN', licenseFamilyIds);

        if (oobRolesOnly)
            gr.addQuery('category', 0); // 0 is the value for "ServiceNow OOB"; 1 is the value for "Custom"

        gr.query();

        const names = new Set();
        while (gr.next())
            names.add(String(gr.sys_user_role));
        return Array.from(names);
    },

    /**
     * Retrieves the roleIds (sys_user_role.sys_id) values assigned to a user
     *
     * @param {guid} userId The sys_user.sys_id for the user to retrieve role information for
     * @returns {array} An array of sys_user_role.sys_id values
     */
    getUserRoleIdsByUserId: function(userId) {
        // Note: It seems adding users to groups projects the roles into sys_user_has_role, so group membership
        //    does not need to be checked in this query.
        const gr = new GlideRecord('sys_user_has_role');
        gr.addQuery('user.sys_id', userId);
        gr.query();

        const ids = new Set();
        while (gr.next())
            ids.add(String(gr.role.sys_id));
        return Array.from(ids);
    },

    /**
     * Retrieves the roleIds (sys_user_role.sys_id) values assigned to a user
     *
     * @param {guid} userId The sys_user.sys_id for the user to retrieve role information for
     * @param {array} meteredRoleIds An array of sys_user_role.sys_id values to limit the results by
     * @returns {array} An array of sys_user_role.sys_id values
     */
    getUserRoleIdsByUserIdAndIsMetered: function(userId, meteredRoleIds) {
        // Note: It seems adding users to groups projects the roles into sys_user_has_role, so group membership
        //    does not need to be checked in this query.
        const gr = new GlideRecord('sys_user_has_role');
        gr.addQuery('user.sys_id', userId);
        gr.addQuery('role.sys_id', 'IN', meteredRoleIds);
        gr.query();

        const ids = new Set();
        while (gr.next())
            ids.add(String(gr.role.sys_id));
        return Array.from(ids);
    },

    /**
     * Retrieves the roleIds (sys_user_role.sys_id) values assigned to a group
     *
     * @param {guid} groupId the sys_user_group.sys_id for the group to retrieve role information for
     * @returns {array} An array of sys_user_role.sys_id values
     */
    getUserRoleIdsByGroupId: function(groupId) {
        const gr = new GlideRecord('sys_group_has_role');
        gr.addQuery('group.sys_id', groupId);
        gr.addQuery('group.active', true);
        gr.query();
        let ids = [];
        while (gr.next())
            ids.push(String(gr.role.sys_id));
        return ids;
    },

    /**
     * Retrieves the roleIds (sys_user_role.sys_id) values assigned to a group
     *
     * @param {guid} groupId the sys_user_group.sys_id for the group to retrieve role information for
     * @param {array} meteredRoleIds An array of sys_user_role.sys_id values to limit the results by
     * @returns {array} An array of sys_user_role.sys_id values
     */
    getUserRoleIdsByGroupIdAndIsMetered: function(groupId, meteredRoleIds) {
        const gr = new GlideRecord('sys_group_has_role');
        gr.addQuery('group.sys_id', groupId);
        gr.addQuery('group.active', true);
        gr.addQuery('role', 'IN', meteredRoleIds);
        gr.query();
        let ids = [];
        while (gr.next())
            ids.push(String(gr.role.sys_id));
        return ids;
    },

    getUserRoleIdsByLicenseFamilyIdsAndLicenseRoleTypeNames: function(licenseFamilyIds, licenseRoleTypeNames, oobRolesOnly) {
        const licensableRoleNames = this._getUserRoleNamesByLicenseFamilyIdsAndLicenseRoleTypeNames(licenseFamilyIds, licenseRoleTypeNames, oobRolesOnly);
        if (licensableRoleNames.length === 0)
            return [];

        return Array.from(this.getUserRoleIdsForRoleNames(licensableRoleNames).values());
    },

    /**
     * Retrives sys_user_role.sys_id given sys_user_role.name values
     * 
     * @param {array} licensableRoleNames role names
     * @returns {map} Map of name to sys_id
     */
    getUserRoleIdsForRoleNames: function(licensableRoleNames) {
        if (licensableRoleNames.length === 0)
            return new Map();

        const gr = new GlideRecord('sys_user_role');
        gr.addQuery('name', 'IN', licensableRoleNames); //Note: Had to query by name since that is what is referenced in the DB view
        gr.query();

        const resultMap = new Map();
        while (gr.next())
            resultMap.set(gr.name.toString(), gr.getUniqueValue());

        return resultMap;
    },

    /**
     * Retrieves the roleIds (sys_user_role.sys_id) values that are marked as OOB
     *
     * @returns {array} An array of sys_user_role.sys_id values
     */
    getUserRoleIdsByIsOob: function() {
        const gr = new GlideRecord('license_role');
        gr.addQuery('category', 0); // OOB Role
        gr.query();
        let ids = [];
        while (gr.next()) {
            const roleId = gr.sys_user_role.sys_id;
            if (roleId)
                ids.push(String(roleId));
        }
        return ids;
    },

    /**
     * Retrieves the roleIds (sys_user_role.sys_id) referenced from sys_security_acl_role.sys_user_role.sys_id
     * where the ACL Role updated time is newer than the provided timestamp
     * 
     * @param {GlideDateTime} timestamp The timestamp used to limit the number of ACL Role records by
     * @returns {array} An array of sys_user_role.sys_id values
     */
    getRoleIdsBySecurityAclRoleUpdatedSince: function(timestamp) {
        const gr = new GlideRecord('sys_security_acl_role');
        gr.addNotNullQuery('sys_user_role');
        if (timestamp)
            gr.addQuery('sys_updated_on', ">=", timestamp);
        gr.query();

        const ids = new Set();
        while (gr.next())
            ids.add(gr.getValue('sys_user_role'));
        return [...ids];
    },

    /**
     * Retrieves the roleIds (sys_user_role.sys_id) referenced from sys_security_acl_role.sys_user_role.sys_id
     * where the ACL updated time is newer than the provided timestamp
     * 
     * @param {GlideDateTime} timestamp The timestamp used to limit the number of ACL records by
     * @returns {array} An array of sys_user_role.sys_id values
     */
    getRoleIdsBySecurityAclUpdatedSince: function(timestamp) {
        const gr = new GlideRecord('sys_security_acl_role');
        gr.addNotNullQuery('sys_security_acl');
        gr.addNotNullQuery('sys_user_role');
        if (timestamp)
            gr.addQuery('sys_security_acl.sys_updated_on', ">=", timestamp);
        gr.query();

        const ids = new Set();
        while (gr.next())
            ids.add(gr.getValue('sys_user_role'));
        return [...ids];
    },

    /**
     * Retrieves a unique list of (sys_user_role.name) values for the provided sys_user_role.sys_id values
     * 
     * @param {array} roleIds An array of sys_user_role.sys_id values to fetch the names for
     * @returns {array} An distinct array of role names
     */
    getUserRoleNamesByUserRoleIds: function(roleIds) {
        const gr = new GlideRecord('sys_user_role');
        gr.addQuery('sys_id', 'IN', roleIds);
        gr.query();

        const names = new Set();
        while (gr.next()) {
            const name = names.add(gr.getValue('name'));
            if (name)
                names.add(name);
        }
        return [...names];
    },

    type: 'UserRoleDao'
};
