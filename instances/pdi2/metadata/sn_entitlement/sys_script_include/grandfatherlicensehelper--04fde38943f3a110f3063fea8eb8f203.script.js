var GrandfatherLicenseHelper = Class.create();
GrandfatherLicenseHelper.prototype = {
    initialize: function() {
        this._licenseCustTableAllotmentDAO = new LicenseCustTableAllotmentDAO();
        this._customTableInventoryDAO = new CustomTableInventoryDAO();
        this._grandfatherLicenseDetails = null;
    },

    /**
     * returns grandfather license details if it is available to map additional tables
     */
    getGrandfatherLicenseDetails: function() {
        return this.canMapToGrandfatherLicense() ? this._getGrandfatherLicenseDetails() : null;
    },

    canMapToGrandfatherLicense: function() {
        return this.getTablesAvailableForGrandfatherLicense() > 0;
    },

    getTablesAvailableForGrandfatherLicense: function() {
        const grandfatherLicenseDetails = this._getGrandfatherLicenseDetails();
        if (global.LicensingScriptUtil.nil(grandfatherLicenseDetails) || global.LicensingScriptUtil.nil(grandfatherLicenseDetails.licenseSysId)) {
            return 0;
        }
        const allocatedCount = this._customTableInventoryDAO.getAllocatedTableCount(grandfatherLicenseDetails.licenseSysId);
        return grandfatherLicenseDetails.numTables - allocatedCount;
    },

    _getGrandfatherLicenseDetails: function() {
        if (global.LicensingScriptUtil.nil(this._grandfatherLicenseDetails))
            this._grandfatherLicenseDetails = this._licenseCustTableAllotmentDAO.getGrandFatherSubscriptionDetails();

        return this._grandfatherLicenseDetails;
    },

    type: 'GrandfatherLicenseHelper'
};
