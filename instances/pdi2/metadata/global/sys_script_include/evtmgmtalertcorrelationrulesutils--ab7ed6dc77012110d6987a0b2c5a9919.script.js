var EvtMgmtAlertCorrelationRulesUtils = Class.create();
EvtMgmtAlertCorrelationRulesUtils.prototype = {
    initialize: function() {
        this.acrProps = new EvtMgmtAlertCorrelationRulesProperties();
        this.acrConsts = new EvtMgmtAlertCorrelationRulesConstants();
    },

    /**
     * IMPORTANT:To check if the feature is active, use 'isVirtualAlertFeatureActive'.
     *
     * Sometimes we'll need to only check the property, and not the entire feature.
     * For example, so we can know whether to display the incentives
     * to enable the feature (i.e., switch the property to true), or not.
     *
     * Returns true if the feature's property is set to true.
     */
    isVirtualAlertFeaturePropertyEnabled: function() {
        return this.acrProps.ENABLE_VIRTUAL_ALERT_FOR_RULE_BASED_GROUPS.getBooleanValue();
    },

    /**
     * It is necessary for the property to be 'true' to activate the feature,
     * but it is also required that new columns we use will exist in the tables.
     * If those conditions exist then it means that the new feature is ready to be used.
     *
     * Returns true if the feature is enabled and active (ready to be used).
     */
    isVirtualAlertFeatureActive: function() {
        // Before getting to the feature's property:
        // 1. Check that the global grouping "evt_mgmt.disable_all_correlation_job" property is enabled
        // 2. Check that the specific alert correlation rules property is enabled
        // If either one is disabled then don't continue with the feature property check
        if (this.acrProps.DISABLE_ALL_CORRELATION_JOB.getBooleanValue() || !this.acrProps.ENABLE_ALERT_CORRELATION.getBooleanValue())
            return false;

        // Here, grouping and alert correlation are enabled, check the virtual alerts for rules-based groups feature's property
        // Check the columns exists, to support upgrading customers
        return this.acrProps.ENABLE_VIRTUAL_ALERT_FOR_RULE_BASED_GROUPS.getBooleanValue() &&
            this.isValidField(this.acrConsts.ACR_TABLE, this.acrConsts.GENERATE_VIRTUAL_ALERTS) &&
            this.isValidField(this.acrConsts.EM_AGG_GROUP, this.acrConsts.GROUP_ORIGIN);
    },

    isValidField: function(tableName, fieldName) {
        return GlideTableDescriptor.fieldExists(tableName, fieldName);
    },

    type: 'EvtMgmtAlertCorrelationRulesUtils'
};
