(function executeRule(current, previous /*null when async*/) {
	g_scratchpad.playbook_preview_table = current.getValue("input_table");
	g_scratchpad.playbook_preview_sysId = current.getValue("input_record");
})(current, previous);
