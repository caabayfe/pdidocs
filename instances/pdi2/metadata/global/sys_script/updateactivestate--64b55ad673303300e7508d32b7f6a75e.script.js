(function executeRule(current, previous /*null when async*/) {
	var gr = new GlideRecord('sm_flapper_strategy_data');
	gr.addQuery('strategy', previous.sys_id); 
	gr.query();
	gr.setValue("active",current.active);
	gr.updateMultiple();
})(current, previous);
