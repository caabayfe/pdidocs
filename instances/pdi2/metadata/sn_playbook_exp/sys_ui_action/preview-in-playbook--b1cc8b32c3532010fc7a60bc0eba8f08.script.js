function openPlaybookPreview() {
	var table = g_scratchpad.playbook_preview_table;
	var sysId = g_scratchpad.playbook_preview_sysId;
	var selectedPlaybook = g_form.getUniqueValue();

	g_navigation.open('/now/playbook/preview/params/table/' + table + '/sys-id/' + sysId + '/selected-playbook/' + selectedPlaybook, '_blank');
}
