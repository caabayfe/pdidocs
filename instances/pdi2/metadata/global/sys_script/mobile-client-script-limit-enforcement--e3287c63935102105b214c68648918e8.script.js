(function executeRule(current, previous /*null when async*/) {
	var RUN_CLIENT_SCRIPT_SYS_ID = 'e16fffc367233110db9fb9770cf9224b';

	var clientScriptsLimit = 1;
	var gr = new GlideRecord('sys_sg_ui_rule_action');
	gr.addQuery('ui_rule', current.ui_rule);
	gr.addQuery('operation',RUN_CLIENT_SCRIPT_SYS_ID);
	gr.addQuery('sys_id', '!=', current.sys_id);
	gr.query();
	if(gr.getRowCount() >= clientScriptsLimit) {
		gs.addErrorMessage(gs.getMessage('A UI Rule Action of type "Run Client Script" is already associated with the selected UI Rule. Only one UI Rule Action of type "Run Client Script" is allowed per UI Rule.'));
		current.setAbortAction(true);
	}
	
})(current, previous);
