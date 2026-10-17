var FamilyEntitlementProcessor = Class.create();
FamilyEntitlementProcessor.prototype = {
    initialize: function() {
        this.logger = new LoggingUtil();
        this.subscriptionHasFamilyDAO = new SubscriptionHasFamilyDAO();
    },

    // returns true if license check required attribute for the given family_id is set to true, else returns false
    isLicenseCheckRequired: function(familyId) {
        try {
            return new UAAppFamilyDAO().isLicenseCheckRequiredForFamily(familyId);
        } catch (error) {
            const errorMsg = LicensingEngineConstants.LICENSING_ERROR_CODES[LicensingEngineConstants.ENTITLEMENT_API_CODE.LICENSE_CHECK_REQUIRED_FAILED] + familyId + error + " \n " + error.stack;
            this.logger.logError(LicensingEngineConstants.FAMILY_ENTITLEMENT_PROCESSOR, LicensingEngineConstants.IS_LICENSE_CHECK_REQUIRED, errorMsg, LicensingEngineConstants.ENTITLEMENT_API_CODE.LICENSE_CHECK_REQUIRED_FAILED, LicensingEngineConstants.LICENSING_ERROR_TYPES.ENTITLEMENT_API);

            return false;
        }
    },

    // returns true if the instance is entitled to the given family_id, else returns false
    isEntitled: function(familyId) {
        try {
            if (!this.doesFamilyExist(familyId)) {
                // if the given lineage_id doesn't have a record in ua_app_family,
                // then it is not a valid lineage_id for performing entitlement checks
                return LicensingEngineConstants.UNABLE_TO_DETERMINE_ENTITLEMENT;
            }
            if (!this.isLicenseCheckRequired(familyId))
                return true;

            // Check explicit entitlement for family
            if (!this.subscriptionHasFamilyDAO.getLicensableStateForFamily(familyId))
                return false;

            var activeSubscriptionsByFamily = this.getActiveSubscriptions(familyId);
            if (activeSubscriptionsByFamily.length == 0) {
                if ( this.logger.isEntitlementLoggingEnabled()) {
                    var errorMsg = LicensingEngineConstants.LICENSING_ERROR_CODES[LicensingEngineConstants.ENTITLEMENT_API_CODE.NO_FAMILY_ENTITLEMENT] + familyId;
                    this.logger.logError(LicensingEngineConstants.FAMILY_ENTITLEMENT_PROCESSOR, LicensingEngineConstants.IS_ENTITLED, errorMsg, LicensingEngineConstants.ENTITLEMENT_API_CODE.NO_FAMILY_ENTITLEMENT, LicensingEngineConstants.LICENSING_ERROR_TYPES.ENTITLEMENT_API);
                }
            }
            return activeSubscriptionsByFamily.length > 0;
        } catch (error) {
            errorMsg = LicensingEngineConstants.LICENSING_ERROR_CODES[LicensingEngineConstants.ENTITLEMENT_API_CODE.NO_FAMILY_ENTITLEMENT] + familyId + error + " \n " + error.stack;
            this.logger.logError(LicensingEngineConstants.FAMILY_ENTITLEMENT_PROCESSOR, LicensingEngineConstants.IS_ENTITLED, errorMsg, LicensingEngineConstants.ENTITLEMENT_API_CODE.NO_FAMILY_ENTITLEMENT, LicensingEngineConstants.LICENSING_ERROR_TYPES.ENTITLEMENT_API);
            return LicensingEngineConstants.UNABLE_TO_DETERMINE_ENTITLEMENT;
        }
    },

    // returns all the entitlement ids of the subscriptions that are active and associated with the given family
    getActiveSubscriptions: function(familyId) {
        return new SubscriptionHasFamilyDAO().getActiveSubscriptionsForFamily(familyId);
    },

    doesFamilyExist: function(familyId) {
        return new UAAppFamilyDAO().doesFamExists(familyId);
    },

    getActiveSubscriptionSysIds: function(familyId) {
        return new SubscriptionHasFamilyDAO().getActiveSubscriptionSysIdsForFamily(familyId);
    },

    type: 'FamilyEntitlementProcessor'
};
