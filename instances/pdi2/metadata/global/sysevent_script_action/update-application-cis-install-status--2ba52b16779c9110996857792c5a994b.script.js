markRelatedApplicationCIsAbsent();

function markRelatedApplicationCIsAbsent() {
	var absentRunningProcesses = JSON.parse(event.parm1);
	var gr = new GlideRecord('cmdb_ci_appl');
	gr.addQuery('running_process', 'IN', absentRunningProcesses);
	gr.addQuery('install_status', '1');

	gr.setValue('install_status', '100');
	gr.updateMultiple();	
}
