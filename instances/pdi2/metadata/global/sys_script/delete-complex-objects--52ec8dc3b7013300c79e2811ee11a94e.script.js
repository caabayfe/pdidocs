(function executeRule(current, previous /*null when async*/) {
	var gr = new GlideRecord('sys_complex_object');
	gr.addQuery('sys_id', 'IN', current.complex_object_ids);
	gr.query();
	gr.deleteMultiple();
})(current, previous);
