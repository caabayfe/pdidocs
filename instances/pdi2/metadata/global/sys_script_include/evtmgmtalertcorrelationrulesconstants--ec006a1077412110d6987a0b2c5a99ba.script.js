var EvtMgmtAlertCorrelationRulesConstants = Class.create();
EvtMgmtAlertCorrelationRulesConstants.prototype = {
    initialize: function() {
        // em_alert_correlation_rule table and fields
        this.ACR_TABLE = 'em_alert_correlation_rule';
        this.GENERATE_VIRTUAL_ALERTS = 'generate_virtual_alerts';
        this.RULE_ORIGIN = 'rule_origin';
        this.TBACE_ACR_PREFIX = '[Tag Based]';
        this.GROUP_OF_ALERTS = 'Group of alerts';
        this.OVERRIDE_GROUP_DESCRIPTION = 'override_group_description';
        this.CUSTOM_GROUP_DESCRIPTION = 'custom_group_description';

        // em_agg_group table and fields
        this.EM_AGG_GROUP = 'em_agg_group';
        this.GROUP_ORIGIN = 'group_origin';
        this.SOURCE_RULE = 'source_rule';
    },

    type: 'EvtMgmtAlertCorrelationRulesConstants'
};
