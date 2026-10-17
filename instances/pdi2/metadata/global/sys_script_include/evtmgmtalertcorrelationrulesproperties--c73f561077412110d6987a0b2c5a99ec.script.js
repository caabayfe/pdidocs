var EvtMgmtAlertCorrelationRulesProperties = Class.create();
EvtMgmtAlertCorrelationRulesProperties.prototype = {
    initialize: function() {
        var acrConstants = new EvtMgmtAlertCorrelationRulesConstants();

        // General property for grouping
        this.DISABLE_ALL_CORRELATION_JOB = this.prop('evt_mgmt.disable_all_correlation_job', 'false');

        // Alert correlation rules property
        this.ENABLE_ALERT_CORRELATION = this.prop('evt_mgmt.enable_alert_correlation', 'true');

        // Virtual alert for rules-based groups
        this.ENABLE_VIRTUAL_ALERT_FOR_RULE_BASED_GROUPS = this.prop('evt_mgmt.enable_virtual_alerts_for_rules_based_groups', 'true');
    },

    prop: function(name, defaultValue) {
        return {
            previousValue: undefined,
            getName: function() {
                return name;
            },
            getDefaultValue: function() {
                return (typeof defaultValue !== 'undefined') ? defaultValue : undefined;
            },
            getValue: function() {
                if (typeof defaultValue !== 'undefined')
                    return gs.getProperty(name, defaultValue);
                return gs.getProperty(name);
            },
            getBooleanValue: function() {
                return this.getValue() === 'true';
            },
            getNumberValue: function() {
                return Number(this.getValue());
            },
            getIntValue: function() {
                return parseInt(this.getValue(), 10);
            },
            setValue: function(value) {
                if (typeof value !== 'undefined') {
                    this.previousValue = this.getValue();
                    gs.setProperty(name, value);
                    return this.getPreviousValue();
                }
            },
            getPreviousValue: function() {
                return this.previousValue;
            },
        };
    },
    type: 'EvtMgmtAlertCorrelationRulesProperties'
};
