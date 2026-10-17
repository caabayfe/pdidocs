function openRecordsWithoutMatchingIntent() {
	var url = '/sys_cs_auto_resolution_sim_context_list.do?sysparm_query=simulation_run_block.simulation_run=' + g_form.getUniqueValue() + '^intent_match=false&sysparm_view=';

	window.open(url, '_blank');
}
