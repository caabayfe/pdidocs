var DefaultEntitlementProcessor = Class.create();
DefaultEntitlementProcessor.prototype = {
    initialize: function() {},

    isLicenseCheckRequired: function(artifactId) {
        return true;
    },

    isEntitled: function(artifactId) {
        return false;
    },

    isUserEntitledForRole: function(userSysId, role, artifactId) {
        return false;
    },

    getUserAccessCheckType: function(artifactId) {
        return LicensingEngineConstants.CHECK;
    },

    getLicenseDetailsForArtifact: function(artifactType, artifactId) {
        return new EntitlementBO();
    },

    type: 'DefaultEntitlementProcessor'
};
