var LicenseRoleServiceV1 = Class.create();
LicenseRoleServiceV1.prototype = {

    /**
     * @param {bool} oobRolesOnly A boolean flag that filters the roles to out-of-box roles when true.
     */
    initialize: function(oobRolesOnly) {
        this._oobRolesOnly = oobRolesOnly;

        this._licenseRoleTypeDaoV1 = new sn_entitlement.PassThroughCache(new sn_entitlement.LicenseRoleTypeDaoV1());
        this._licenseDetailDaoV1 = new sn_entitlement.PassThroughCache(new sn_entitlement.LicenseDetailDaoV1());
        this._userRoleDaoV1 = new sn_entitlement.PassThroughCache(new sn_entitlement.UserRoleDaoV1());
    },

    /**
     * Retrieves an array of sys_user_role.sys_id values that require a license
     * This is the super-set of all roles requiring a license (across all license)
     *
     * @returns {array} An array of sys_user_role.sys_id values
     */
    getRoleIdsByRequiresALicense: function() {
        const roleIds = this._licenseDetailDaoV1.getLicenseIdsByIsPerUser()
            .flatMap(roleId => this.getRoleIdsByLicenseIdAndRequiresALicense(roleId, this._oobRolesOnly));
        return Array.from(new Set(roleIds));
    },

    /**
     * Retrieves an array of sys_user_role.sys_id values that require a license for the provided licenseId
     * This is just the set of roles requiring a license for this specific license
     *
     * @param {guid} licenseId The license_details.sys_id of the license to get sys_user_role.sys_id values for
     * @param {bool} oobRolesOnly A boolean flag that filters the roles to out-of-box roles when true.
     * @returns {array} An array of sys_user_role.sys_id values
     */
    getRoleIdsByLicenseIdAndRequiresALicense: function(licenseId, oobRolesOnly) {
        const licensableRoleTypeNames = this._licenseRoleTypeDaoV1.getLicenseRoleTypeNamesByLicenseId(licenseId);
        return this._userRoleDaoV1.getUserRoleIdsByLicenseIdAndLicenseRoleTypeNames(licenseId, licensableRoleTypeNames, oobRolesOnly);
    },

    /**
     * Retrieves all role IDs associated with the license identified even if the role is not
     * a metered role for the license
     *
     * @param {guid} licenseId The license ID to get roles for
     * @returns {array} An array of role IDs associated with the license
     */
    getUserRoleIdsByLicenseId: function(licenseId) {
        return this._userRoleDaoV1.getUserRoleIdsByLicenseId(licenseId, this._oobRolesOnly);
    },

    type: 'LicenseRoleServiceV1'
};
