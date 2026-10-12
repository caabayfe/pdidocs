(function executeRule(current, previous /*null when async*/) {
	var gr = new GlideRecord('sys_unreferenced_preview');
	gr.addQuery('rule_id', current.sys_id);
	gr.query();
	gr.deleteMultiple();
})(current, previous);
