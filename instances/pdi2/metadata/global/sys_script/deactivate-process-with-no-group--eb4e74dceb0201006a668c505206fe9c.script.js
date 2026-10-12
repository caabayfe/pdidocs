// If this is the last group of the process and the process does not have the flag "apply_to_all_users", deactivate the process
deactivate();

function deactivate() {
	var gr = new GlideRecord('pwd_map_proc_to_group');
	gr.addQuery('process', current.process);
	gr.addQuery('sys_id', '<>', current.sys_id); // Look at other groups for this process
	gr.query();
	
	// If there are no other records, it means current is the last group for the process
	if (!gr.hasNext()) {
		// Check if the process does not have the option "Apply to all users"
		var proc = new GlideRecord('pwd_process');
		proc.addQuery('apply_to_all_users', false);
		proc.addQuery('sys_id', current.process);
		proc.addQuery('active', true);
		proc.query();
		
		// Process has one group and flag "Apply to all users" false
		if (proc.next()) { 
			gs.addInfoMessage(gs.getMessage("You must either specify a Group for this process or select the 'Apply to all users' option"));
			gs.addInfoMessage(gs.getMessage('Process deactivated: {0}', [proc.getValue('name')]));
			proc.setValue('active', false);
			proc.update();
		}
	}
}
