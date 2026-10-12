var UserRoleDaoV1 = Class.create();
UserRoleDaoV1.prototype = {
    initialize: function() {},

    /**
     * Retrieves the roleIds associated to the license provided
     *
     * @param {guid} licenseId The license_details.sys_id to filter the sys_user_role records by
     * @param {bool} oobRolesOnly A boolean flag that filters the roles to out-of-box roles when true.
     * @return {array} An array of sys_user_role.sys_id values
     */
    getUserRoleIdsByLicenseId: function(licenseId, oobRolesOnly) {
        const gr = this._createGlideQueryForLicenseDetailsAssociatedRoles(licenseId, oobRolesOnly);
        gr.query();

        return this._mapAssocRoleRecordsToLicenseRoleIds(gr);
    },

    /**
     * Retrieves the roleIds (sys_ids) associated to the licenseId (sys_id) provided
     * filtered down to just the license_role_type.sys_id values provided
     *
     * @param {guid} licenseId The license_details.sys_id to filter the sys_user_role records by
     * @param {array} licenseRoleTypeNames The license_role_type.name values to limit the results by
     * @param {bool} oobRolesOnly A boolean flag that filters the roles to out-of-box roles when true.
     * @return {array} An array of sys_user_role.sys_id values
     */
    getUserRoleIdsByLicenseIdAndLicenseRoleTypeNames: function(licenseId, licenseRoleTypeNames, oobRolesOnly) {
        const gr = this._createGlideQueryForLicenseDetailsAssociatedRoles(licenseId, oobRolesOnly);
        gr.addQuery('lr_license_role_type', 'IN', licenseRoleTypeNames);
        gr.query();

        return this._mapAssocRoleRecordsToLicenseRoleIds(gr);
    },

    /**
     * Pre-configures the common query that is likely to always be used when reading from
     * license_details_assoc_roles and returns the pre-configured GlideRecord
     *
     * @param {guid} licenseId The license_details.sys_id to filter the sys_user_role records by
     * @param {bool} oobRolesOnly A boolean flag that filters the roles to out-of-box roles when true.
     * @return {GlideRecord} A pre-configured GlideRecord query
     */
    _createGlideQueryForLicenseDetailsAssociatedRoles: function(licenseId, oobRolesOnly) {
        const gr = new GlideRecord('license_details_assoc_roles');
        gr.addQuery('lhf_license', licenseId);

        if (oobRolesOnly)
            gr.addQuery('lr_category', 0); // 0 is the value for "ServiceNow OOB"; 1 is the value for "Custom"

        return gr;
    },

    /**
     * Retrieves the distinct sys_user_role.sys_id values from a license_details_assoc_roles query
     *
     * @param {GlideRecord} The glide record that has been queried and has records to process
     * @return {array} An array of sys_user_role.sys_id values for the related roles
     */
    _mapAssocRoleRecordsToLicenseRoleIds: function(gr) {
        const ids = new Set();
        while (gr.next())
            if (gr.lr_sys_user_role.sys_id)
                ids.add(String(gr.lr_sys_user_role.sys_id));
        return Array.from(ids);
    },

    type: 'UserRoleDaoV1'
};
