(function executeRule(current, previous /*null when async*/) {

	var gr = new GlideRecord('sys_cs_topic_library_usage');
	gr.addQuery('node_id', current.node_id);
	gr.addQuery('sys_id', '!=', current.getUniqueValue());
	gr.query();
	gr.deleteMultiple();

})(current, previous);
