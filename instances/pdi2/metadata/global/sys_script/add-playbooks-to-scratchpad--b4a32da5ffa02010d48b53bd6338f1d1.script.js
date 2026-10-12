(function executeRule(current, previous /*null when async*/) {

	// Add your code here
	var playbookMapping = new GlideRecord('sys_playbook_experience_action_assignment_map');
	playbookMapping.addQuery('declarative_action_assignment',current.getUniqueValue());
	playbookMapping.setLimit(1);
	playbookMapping.query();
	g_scratchpad.containsPlaybooks = playbookMapping.hasNext();

})(current, previous);
