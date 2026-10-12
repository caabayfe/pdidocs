var SN_LicensingUtils = Class.create();
SN_LicensingUtils.prototype = Object.extendsObject(AbstractAjaxProcessor, {
    initialize: function() {
        this.PER_USER_LICENSE = 0;
        this.CAPACITY_LICENSE = 1;
        this.MAX_USER_LICENSE = 2;
        this.UNLIMITED_USER_LICENSE = 3;
        this.LicenseType = Object.freeze({
            USER_BASED_LICENSES: Object.freeze([this.PER_USER_LICENSE, this.MAX_USER_LICENSE, this.UNLIMITED_USER_LICENSE]),
            CAPACITY_BASED_LICENSES: Object.freeze([this.CAPACITY_LICENSE])
        });
    },
    getUserBasedLicenses: function() {
        return this.LicenseType.USER_BASED_LICENSES;
    },

    getCapacityBasedLicenses: function() {
        return this.LicenseType.CAPACITY_BASED_LICENSES;
    },
    type: 'SN_LicensingUtils'
});
