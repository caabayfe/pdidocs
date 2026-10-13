(function executeRule(current, previous /*null when async*/) {
	var gr = new GlideRecord('em_ci_severity_task');
	gr.initialize(); 
	gr.setValue('ci', current.sys_id);
	gr.setValue('type', "business_service");
	gr.setValue('new_severity', '5');
	gr.setValue('severity', '5');
	gr.insert();
})(current, previous);
