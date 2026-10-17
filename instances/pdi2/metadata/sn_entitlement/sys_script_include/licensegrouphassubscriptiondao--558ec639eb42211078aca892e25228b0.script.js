var LicenseGroupHasSubscriptionDAO = Class.create();
LicenseGroupHasSubscriptionDAO.prototype = {
    initialize: function() {
        this._groupHasSubscriptionTable = "license_group_has_subscription";
    },

    /**
     * @return {object} an object map of group sysids to product code
     */
    getGroupSysIdToProductCodeMap: function() {
        let groupSysIdToProductCodeMap = {};
        const groupHasSubscriptionGr = new GlideRecord(this._groupHasSubscriptionTable);
        groupHasSubscriptionGr.addQuery('source', 'group');
        groupHasSubscriptionGr.query();
        while (groupHasSubscriptionGr.next()) {
            let groupSysId = groupHasSubscriptionGr.getElement('group.sys_id');
            let productCode = String(groupHasSubscriptionGr.getElement('license.product_code'));
            let errorMessage = global.LicensingScriptUtil.nil(productCode) ? "group_mapped_to_license_with_no_product_code" : productCode.includes(",") ? "group_mapped_to_consolidated_license" : null;
			const mapKey = groupSysId + '-' + productCode;
            global.LicensingScriptUtil.nil(errorMessage) ? groupSysIdToProductCodeMap[mapKey] = productCode : groupSysIdToProductCodeMap[groupSysId] = errorMessage;
        }
        return groupSysIdToProductCodeMap;
    },

    /**
     * Retrieves the number of groups that are subscribed to the provided license
     * 
     * @param {uuid} licenseId The license_detail.sys_id to filter by
     * @returns {int} The count of the number of groups subscribed to the license
     */
    getCountByLicenseId: function(licenseId) {
        const gr = new GlideRecord(this._groupHasSubscriptionTable);
        gr.addQuery('license.sys_id', licenseId);
        gr.query();
        return gr.getRowCount();
    },

    type: 'LicenseGroupHasSubscriptionDAO'
};
