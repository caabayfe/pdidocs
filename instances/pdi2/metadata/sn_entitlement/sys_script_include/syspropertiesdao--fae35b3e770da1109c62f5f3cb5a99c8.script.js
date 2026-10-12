var SysPropertiesDAO = Class.create();
SysPropertiesDAO.prototype = {
    initialize: function() {},

    getDeveloperInstanceProp: function() {
        return gs.getProperty(LicensingEngineConstants.GLIDE_INSTALLATION_DEVELOPER, false);
    },

    getDeveloperInstanceClosedProp: function() {
        return gs.getProperty(LicensingEngineConstants.GLIDE_DEV_INST_CLOSED, false);
    },

    getSelfHostedInstanceProp: function() {
        return gs.getProperty(LicensingEngineConstants.GLIDE_INSTALLATION_SELFHOSTED, false);
    },

    getInstanceName: function() {
        return gs.getProperty(LicensingEngineConstants.INSTANCE_NAME, LicensingEngineConstants.DEFAULT_INSTANCE_NAME);
    },

    getCentralInstance: function() {
        return gs.getProperty(LicensingEngineConstants.PROP_GLIDE_USAGEANALYTICS_CENTRAL_INSTANCE);
    },

    getGlobalEntitlementEnforceMode: function() {
        return gs.getProperty(LicensingEngineConstants.PROP_ENTITLEMENT_ENFORCE_MODE);
    },

    getOverrideEntitlementEnforceMode: function() {
        return gs.getProperty(LicensingEngineConstants.OVERRIDE_PROP_ENTITLEMENT_ENFORCE_MODE);
    },

    getProperty: function(property) {
        return gs.getProperty(property);
    },

    getInstanceId: function() {
        return gs.getProperty(LicensingEngineConstants.INSTANCE_ID);
    },

    type: 'SysPropertiesDAO'
};
