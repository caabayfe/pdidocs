(function executeRule(current, previous /*null when async*/) {
	var specificity = 10 * GlideDBObjectManager.getTables(current.table).size();
	var gr = new GlideRecord('sys_ux_ribbon_config_setting');
	if (!gr.isValid())
		return;
	gr.addQuery('ribbon', current.sys_id);
	gr.addQuery('table', '!=', current.table);
	gr.setValue('specificity', specificity);
	gr.setValue('table', current.table);
	gr.setWorkflow(false);
	gr.updateMultiple();
})(current, previous);
