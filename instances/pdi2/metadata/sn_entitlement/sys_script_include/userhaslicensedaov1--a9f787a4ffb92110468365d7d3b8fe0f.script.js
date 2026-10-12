var UserHasLicenseDaoV1 = Class.create();
UserHasLicenseDaoV1.prototype = {
    initialize: function() {},

    /**
     * Counts the number of sys_user_has_license records that match the licenseId and the user is active
     *
     * @param {guid} licenseId The license_details.sys_id to filter records by
     * @returns {number} A number 0 or greater indicating the number of rows that match
     */
    getCountByLicenseIdAndUserIsActive: function(licenseId) {
        const gr = new GlideRecord('sys_user_has_license');
        gr.addQuery('license', licenseId);
        gr.addQuery('user.active', true);
        gr.query();
        return gr.getRowCount();
    },

    type: 'UserHasLicenseDaoV1'
};
