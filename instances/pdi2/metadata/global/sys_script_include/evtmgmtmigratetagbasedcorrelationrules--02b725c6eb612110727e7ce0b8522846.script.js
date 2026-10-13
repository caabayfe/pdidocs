var EvtMgmtMigrateTagBasedCorrelationRules = Class.create();
EvtMgmtMigrateTagBasedCorrelationRules.prototype = {
    initialize: function() {
        this.ACR_TABLE_NAME = 'em_alert_correlation_rule';
        this.TBAC_TABLE_NAME = 'sn_em_tbac_alert_clustering_definitions';

        this.GENERATE_VIRTUAL_ALERTS_COLUMN = 'generate_virtual_alerts';
        this.ALERT_CORRELATION_RULE_COLUMN = 'alert_correlation_rule';
        this.NAME_COLUMN = 'name';
        this.acrUtils = new EvtMgmtAlertCorrelationRulesUtils();
        this.evtMgmtCommons = new EvtMgmtCommons();
    },

    migrate: function() {
        var startTime = new Date();

		if (!this.acrUtils.isVirtualAlertFeatureActive()) {
			this.evtMgmtCommons.addDebugLogNoPrefix(this.type + 
			': the virtual alerts for tag-based groups feature is disabled, migration will not be done.');
			return;
		}
 
        this.evtMgmtCommons.addDebugLogNoPrefix(this.type + ': the virtual alerts for tag-based groups feature is enabled.');

        var count = 0;
        var affectedRules = this.getAffectedRules();

        if (affectedRules.length > 0) {
            var tbac = new GlideRecord(this.TBAC_TABLE_NAME);
            tbac.addQuery(this.ALERT_CORRELATION_RULE_COLUMN, 'IN', affectedRules);
            tbac.query();
            count = tbac.getRowCount();
            if (count > 0) {
                tbac.setForceUpdate(true);
                tbac.updateMultiple();
            }
        }

        var endTime = new Date();
        var duration = (endTime.getTime()) - startTime.getTime();
        this.evtMgmtCommons.addDebugLogNoPrefix(this.type + ': ' + count + ' rules were updated. Duration: ' + duration + 'ms');
    },

    getAffectedRules: function() {
        var acr = new GlideRecord(this.ACR_TABLE_NAME);
        acr.addQuery(this.NAME_COLUMN, 'STARTSWITH', '[Tag Based]');
        acr.addQuery(this.GENERATE_VIRTUAL_ALERTS_COLUMN, false);
        acr.query();

        affectedRules = [];
        while (acr.next()) {
            affectedRules.push(acr.getValue('sys_id'));
        }

        return affectedRules;
    },

    type: 'EvtMgmtMigrateTagBasedCorrelationRules'
};
