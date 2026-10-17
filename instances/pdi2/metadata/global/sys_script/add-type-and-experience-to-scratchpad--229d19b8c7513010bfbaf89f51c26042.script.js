(function executeRule(current, previous /*null when async*/) {
	if ((current.activity_definition || {}).activity_type) {
		g_scratchpad.experience_type = current.activity_definition.activity_type;
	} else if ((current.activity_ui || {}).experience_type) {
		g_scratchpad.experience_type = current.activity_ui.experience_type;
		g_scratchpad.playbook_experience = current.activity_ui.playbook_experience;
	}
})(current, previous);
