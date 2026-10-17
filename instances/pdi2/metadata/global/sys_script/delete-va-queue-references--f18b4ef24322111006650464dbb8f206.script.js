(function executeRule(current, previous /*null when async*/) {

	var gr = new GlideRecord('sys_cs_atf_queue');
	gr.addNullQuery('test');
	gr.query();
	gr.deleteMultiple();

})(current, previous);
