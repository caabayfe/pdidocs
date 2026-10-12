(function executeRule(current, previous /*null when async*/) {

	var gr = new GlideRecord('sys_cs_custom_control_execution_plan');
	gr.addQuery('custom_control', current.custom_control);
	gr.addQuery('topic', current.topic);
	gr.addQuery('topic_node_id', current.topic_node_id);
	gr.addQuery('sys_id', '!=', current.getUniqueValue());
	gr.query();
	gr.deleteMultiple();
	
})(current, previous);
