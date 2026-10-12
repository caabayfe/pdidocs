var FeatureEnablementProcessor = Class.create();
FeatureEnablementProcessor.prototype = {
    initialize: function() {},

    processFeatureEnablementFlags: function(featureEnablementFlags) {
        if (gs.nil(featureEnablementFlags)) {
            gs.warn("FeatureEnablementProcessor:: Feature enablement flags object is empty. Aborting operation.");
            return;
        }
        this._processUnconfirmedUserFlowFlag(featureEnablementFlags.is_unconfirmed_user_flow_enabled);
    },

    _processUnconfirmedUserFlowFlag: function(flagValueFromCI) {
        if (typeof flagValueFromCI !== 'boolean') {
            gs.warn("FeatureEnablementProcessor:: Provided flag value is not a boolean. Aborting operation.");
            return;
        }
        const currentFlagValue = gs.getProperty('sn_sub_man.unconfirmed_user_flow_enabled', 'false') === 'true';
        if (currentFlagValue === flagValueFromCI) {
            return;
        }
        gs.setProperty('sn_sub_man.unconfirmed_user_flow_enabled', flagValueFromCI);
        gs.info(`Updated the unconfirmed user flow property value to '${flagValueFromCI}' on the instance.`);
    },

    type: 'FeatureEnablementProcessor'
};
