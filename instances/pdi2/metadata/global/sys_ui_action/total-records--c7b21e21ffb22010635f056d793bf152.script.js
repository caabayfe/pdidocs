function openSimulationContextsForRun() {
	var url = '/sys_cs_auto_resolution_sim_context_list.do?sysparm_query=simulation_run_block.simulation_run=' + g_form.getUniqueValue() + '&sysparm_view=';

window.open(url, '_blank');
}
