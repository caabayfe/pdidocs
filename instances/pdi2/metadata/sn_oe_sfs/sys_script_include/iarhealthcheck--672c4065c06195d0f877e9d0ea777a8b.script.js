var IARHealthCheck = Class.create();
IARHealthCheck.prototype = {
    initialize: function() {},

    type: 'IARHealthCheck'
};

/**
 * @returns an array of all IAR configurations, each configuration is {"sys_id", "table_display_value"}
 */
IARHealthCheck.getIARConfigurations = function() {
    var gr = new GlideRecord("sys_cs_auto_resolution_configuration");
    gr.query();
    var configs = [];
    while (gr.next()) {
        var grTableDisplayValue = new GlideRecord(gr.getDisplayValue());
        var table_display_value = grTableDisplayValue.getClassDisplayValue();
        configs.push({
            "sys_id": gr.getValue('sys_id'),
            "table_display_value": table_display_value,
        });
    }
    return configs;
};

/**
 * @returns a boolean representing whether the prediction server is up
 */
IARHealthCheck.checkIsPredictionServerUp = function() {
    var result = false;
    var options = {};
    var results = sn_ml.AgentZeroSolutionStore.getSupportedOOBIntents(options);
    if (!gs.nil(results)) {
        result = true;
    }
    return result;
};

/**
 * @returns a boolean representing whether there are any IAR configurations
 */
IARHealthCheck.checkConfigsExist = function() {
    var grConfig = new GlideRecord("sys_cs_auto_resolution_configuration");
    grConfig.query();
    return grConfig.getRowCount() > 0;
};

/**
 * @returns a boolean representing whether there are any active IAR configurations
 */
IARHealthCheck.checkActiveConfigExists = function() {
    var grConfig = new GlideRecord("sys_cs_auto_resolution_configuration");
    grConfig.query();
    while (grConfig.next()) {
        if (grConfig.active) {
            return true;
        }
    }
    return false;
};

/**
 * @param sys_id of the IAR configuration record to be checked
 * @returns a boolean representing whether the configuration is active
 */
IARHealthCheck.checkConfigActive = function(config_sys_id) {
    var grConfig = new GlideRecord("sys_cs_auto_resolution_configuration");
    grConfig.get(config_sys_id);
    return grConfig.active;
};

/**
 * @param sys_id of the IAR configuration record to be checked
 * @returns a boolean representing whether the configuration has an active configuration language
 */
IARHealthCheck.checkConfigLanguageActive = function(config_sys_id) {
    var grConfigLanguage = new GlideRecord("sys_cs_auto_resolution_configuration_language");
    grConfigLanguage.addQuery("configuration", config_sys_id);
    grConfigLanguage.addQuery("active", true);
    grConfigLanguage.query();
    return grConfigLanguage.getRowCount() > 0;
};

/**
 * @param sys_id of the IAR configuration record to be checked
 * @returns a boolean representing whether the configuration has an active response channel
 */
IARHealthCheck.checkReponseChannelActive = function(config_sys_id) {
    var grResponseChannel = new GlideRecord("sys_cs_auto_resolution_response_channel");
    grResponseChannel.addQuery("configuration", config_sys_id);
    grResponseChannel.addQuery("active", true);
    grResponseChannel.query();
    return grResponseChannel.getRowCount() > 0;
};

/**
 * @param sys_id of the IAR configuration record to be checked
 * @returns a boolean representing whether the configuration has an active intent topic map
 */
IARHealthCheck.checkIntentTopicMapActive = function(config_sys_id) {
    var grIntentTopicMap = new GlideRecord("sys_cs_auto_resolution_intent_topic_map");
    grIntentTopicMap.addQuery("ar_configuration", config_sys_id);
    grIntentTopicMap.addQuery("active", true);
    grIntentTopicMap.query();
    return grIntentTopicMap.getRowCount() > 0;
};

/**
 * @param sys_id of the IAR configuration record to be checked
 * @returns a boolean representing whether AI search is enabled for the configuration
 */
IARHealthCheck.checkAISearchEnabled = function(config_sys_id) {
    var grConfig = new GlideRecord("sys_cs_auto_resolution_configuration");
    grConfig.get(config_sys_id);
    return grConfig.ais_enabled;
};

/**
 * @param sys_id of the IAR configuration record to be checked
 * @returns a boolean representing whether "Use SLA Engine" is true for the configuration
 */
IARHealthCheck.checkUseSLA = function(config_sys_id) {
    var grConfig = new GlideRecord("sys_cs_auto_resolution_configuration");
    grConfig.get(config_sys_id);
    return grConfig.use_sla;
};
