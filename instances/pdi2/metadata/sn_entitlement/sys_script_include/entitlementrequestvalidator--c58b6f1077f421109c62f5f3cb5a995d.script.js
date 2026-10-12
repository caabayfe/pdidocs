var EntitlementRequestValidator = Class.create();
EntitlementRequestValidator.prototype = {
    initialize: function() {
        this.requestProcessorFactory = new EntitlementProcessorFactory();
        this.logger = new LoggingUtil();
    },

    isValidArtifact: function(artifactType, artifactId) {
        if (gs.nil(artifactType) || gs.nil(artifactId) || !this.isArtifactTypeSupported(artifactType)) {
            if (this.logger.isEntitlementLoggingEnabled()) {
                this.logger.logInvalidArtifact(artifactType, artifactId);
            }
            return false;
        }
        return true;
    },

    isArtifactTypeSupported: function(artifactType) {
        var supportedArtifactTypes = [LicensingEngineConstants.APP_ID, LicensingEngineConstants.CUSTOM_TABLE, LicensingEngineConstants.FAMILY_ID, LicensingEngineConstants.FGE_ID];
        supportedArtifactTypes.push(...LicensingEngineConstants.SUPPORTED_SKU_METADATA_TYPE);
        return supportedArtifactTypes.indexOf(artifactType) > -1;
    },

    isValidArtifactForLicenseCheck: function(artifactType, artifactId) {
        var supportedArtifactTypesForLicenseCheck = [LicensingEngineConstants.APP_ID, LicensingEngineConstants.FAMILY_ID];
        if (gs.nil(artifactType) || gs.nil(artifactId) || supportedArtifactTypesForLicenseCheck.indexOf(artifactType) == -1) {
            if (this.logger.isEntitlementLoggingEnabled()) {
                this.logger.logInvalidArtifact(artifactType, artifactId);
            }
            return false;
        }
        return true;
    },

    isValidEntity: function(entity) {
        return !gs.nil(entity);
    },

    isValidUser: function(user) {
        if (gs.nil(user))
            return false;

        if (LicensingEngineConstants.DEFAULT_USER.equals(user) || LicensingEngineConstants.SYSTEM.equals(user))
            return false;

        return true;
    },

    isValidArtifactForUserEntitlements: function(artifactType, artifactId) {
        var supportedArtifactsForUserEntitlements = [LicensingEngineConstants.APP_ID, LicensingEngineConstants.CUSTOM_TABLE];
        if (gs.nil(artifactType) || gs.nil(artifactId) || supportedArtifactsForUserEntitlements.indexOf(artifactType) == -1) {
            if (this.logger.isEntitlementLoggingEnabled()) {
                this.logger.logInvalidArtifact(artifactType, artifactId);
            }
            return false;
        }
        return true;
    },

    isValidArtifactForLicenseDetails: function(artifactType, artifactId) {
        var supportedArtifactTypesForLicenseDetails = [LicensingEngineConstants.APP_ID];
        if (gs.nil(artifactType) || gs.nil(artifactId) || supportedArtifactTypesForLicenseDetails.indexOf(artifactType) == -1) {
            if (this.logger.isEntitlementLoggingEnabled()) {
                this.logger.logInvalidArtifact(artifactType, artifactId);
            }
            return false;
        }
        return true;
    },

    type: 'EntitlementRequestValidator'
};
