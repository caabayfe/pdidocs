var LicenseRoleTypeDaoV1 = Class.create();
LicenseRoleTypeDaoV1.prototype = {
    initialize: function() {
        this._dbUtil = new sn_entitlement.DBUtil();
    },

    /**
     * Retrieves the license_role_type.name values for the license_details.measured_role_types list
     * This can be used to identify the role types that need a license
     *
     * @param {guid} licenseId The license_details.sys_id to retrieve measured_role_types information for
     * @returns {array} An array of license_role_type.name values
     */
    getLicenseRoleTypeNamesByLicenseId: function(licenseId) {
        const gr = new GlideRecord('license_role_type');
        gr.addQuery('sys_id', 'IN', this._getLicenseRoleTypeIdsByLicenseId(licenseId));
        gr.addQuery('active', true);
        gr.query();

        let names = [];
        if (gr.next())
            names.push(String(gr.id));
        return names;
    },

    /**
     * Retrieves the license_role_type.sys_id values for the license_details.measured_role_types list
     * This can be used to identify the role types that need a license
     *
     * @param {guid} licenseId The license_details.sys_id to retrieve measured_role_types information for
     * @returns {array} An array of license_role_type.sys_id values
     */
    _getLicenseRoleTypeIdsByLicenseId: function(licenseId) {
        const gr = new GlideRecord('license_details');
        return gr.get(licenseId) ?
            this._dbUtil.convertGlideListToArray(gr.getValue('measured_role_types')) : [];
    },

    type: 'LicenseRoleTypeDaoV1'
};
