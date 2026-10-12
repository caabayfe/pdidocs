var FamilyInfoAPI = Class.create();
FamilyInfoAPI.prototype = {
    initialize: function() {
        this.requestValidator = new EntitlementRequestValidator();
        this.logger = new LoggingUtil();
        this.licenseFamilyDao = new LicenseFamilyDao();
    },

    /**
     * Returns sys_id of license_family record for given family_id
     * Used to populate 'source_application_family' field in syslog records
     */
    getFamilySysId: function(familyId) {
        if (!this.requestValidator.isValidArtifact(LicensingEngineConstants.FAMILY_ID, familyId) && this.logger.isEntitlementLoggingEnabled()) {
            this.logger.logCouldNotDetermine(LicensingEngineConstants.FAMILY_INFO_API, LicensingEngineConstants.GET_FAMILY_SYS_ID,
                LicensingEngineConstants.GET_SYS_ID_OF_FAMILY);
            return "";
        }
        return this.licenseFamilyDao.getFamilySysId(familyId);
    },

    type: 'FamilyInfoAPI'
};
