var LicenseRoleTypeDao = Class.create();
LicenseRoleTypeDao.prototype = {
    initialize: function() {
        this._dbUtil = new sn_entitlement.DBUtil();
    },

    /**
     * Retrieves the license_role_type.name values for the subscription_entitlement.measured_role_types list
     * This can be used to identify the role types that need a license
     *
     * @param {guid} subscriptionId The subscription_entitlement.sys_id to retrieve measured_role_types information for
     * @returns {array} An array of license_role_type.name values
     */
    getLicenseRoleTypeNamesBySubscriptionId: function(subscriptionId) {
        const gr = new GlideRecord('license_role_type');
        gr.addQuery('sys_id', 'IN', this._getLicenseRoleTypeIdsBySubscriptionId(subscriptionId));
        gr.addQuery('active', true);
        gr.query();

        let names = [];
        while (gr.next())
            names.push(String(gr.id));
        return names;
    },

    /**
     * Retrieves the license_role_type.sys_id values for the subscription_entitlement.measured_role_types list
     * This can be used to identify the role types that need a license
     *
     * @param {guid} subscriptionId The subscription_entitlement.sys_id to retrieve measured_role_types information for
     * @returns {array} An array of license_role_type.sys_id values
     */
    _getLicenseRoleTypeIdsBySubscriptionId: function(subscriptionId) {
        const gr = new GlideRecord('subscription_entitlement');
        gr.addQuery('sys_id', subscriptionId);
        gr.query();

        let ids = [];
        while (gr.next())
            ids = this._dbUtil.convertGlideListToArray(gr.getValue('measured_role_types'));
        return ids;
    },

    type: 'LicenseRoleTypeDao'
};
