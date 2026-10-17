(function executeRule(current, previous /*null when async*/) {
	var gr = new GlideRecord('azure_alert_rule');
	gr.addQuery('rule_name', current.rule_name);
	gr.addQuery('active', current.active);
	gr.setLimit(1);
	gr.query();

	if (gr.next() && gr.sys_id != current.sys_id && gr.active) {
		gr.setValue('active', false);
		gr.update();
		var msgArr = ['\'' + gr.rule_name + '\'', gr.sys_id];
		gs.addInfoMessage(gs.getMessage('Previous Active Rule Named {0} record with SysId-{1} is now Inactive.', msgArr));
	}
})(current, previous);
