var CMDBWsFeatureSupportUtil = Class.create();
CMDBWsFeatureSupportUtil.prototype = {
    initialize: function() {},

    DELIMITER: ',',
    SUPPORTED_FEATURE_PROP_NAME: 'glide.cmdb_ws.supported_features',
    FEATURE_IDS: {
        CMDB_STAGING: {
            ID: 'cmdb_staging',
            MESSAGE: gs.getMessage("CMDB Staging feature is not supported.")
        },
        DEDUPE_TEMPLATE: {
            ID: 'dedupe_template',
            MESSAGE: gs.getMessage("Dedupe Template feature is not supported.")
        },
        UNIFIED_MAP: {
            ID: 'unified_map',
            MESSAGE: gs.getMessage("Unified Map is not supported on instances with version Utah or below.")
        },
        DATA_MANAGER: {
            ID: 'data_manager',
            MESSAGE: gs.getMessage("Data Manager is not supported on instances with version Vancover or below")
        }
    },

    supportsFeature: function(featureId) {
        var propValue = gs.getProperty(this.SUPPORTED_FEATURE_PROP_NAME, false);
        if (!propValue)
            return false;

        propValue = propValue.split(this.DELIMITER);

        return propValue.indexOf(featureId) > -1;
    },

    getUnsupportedFeatureMessage: function(featureId) {
        var featureIdKeys = Object.keys(this.FEATURE_IDS);
        for (var i = 0; i < featureIdKeys.length; i++) {
            if (featureId === this.FEATURE_IDS[featureIdKeys[i]].ID)
                return this.FEATURE_IDS[featureIdKeys[i]].MESSAGE;
        }
        return gs.getMessage("Unknown feature is not supported.");
    },

    type: 'CMDBWsFeatureSupportUtil'
};
