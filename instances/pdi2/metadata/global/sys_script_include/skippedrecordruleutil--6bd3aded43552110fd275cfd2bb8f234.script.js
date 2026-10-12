var SkippedRecordRuleUtil = Class.create();
SkippedRecordRuleUtil.prototype = Object.extendsObject(AbstractAjaxProcessor, {
	triggerRules: function() {
        try {
            var ruleIds = this.getParameter("sysparm_sysIds");
            var upgradeHistorySysId = this.getParameter("sysparm_upgradeHistorySysId");
            var progressId = "";

            if(!gs.nil(ruleIds)) {
               progressId = new sn_usr.SkippedRecordRuleAPI().triggerRules([ruleIds]);
            } else if(!gs.nil(upgradeHistorySysId)) {
               progressId = new sn_usr.SkippedRecordRuleAPI().runAllActiveRules(upgradeHistorySysId);
            }

            return JSON.stringify({
                progressId: progressId
            });
        } catch (e) {
            return JSON.stringify({
                errorMessage: e.message
            });
        }
    },
	getUpgradeHistory: function() {
		var gr = new GlideRecord('sys_upgrade_history');
		gr.addQuery("history_type", "Upgrade");
		gr.addNotNullQuery("to_version");
		gr.setLimit(1);
		gr.orderByDesc('upgrade_finished');
		gr.query();
		
		if(gr.next())
			return gr.getUniqueValue();
		
		return null;
	},
    type: 'SkippedRecordRuleUtil'
});
