// if this is the last verification of the process, deactivate it

deactivate();

function deactivate() {
	var gr = new GlideRecord('pwd_map_proc_to_verification');
	gr.addQuery('process', current.process);
	gr.addQuery('sys_id', '<>', current.sys_id);
	gr.query();
	var numVerifications = gr.getRowCount();
	
	var proc = new GlideRecord('pwd_process');
	
	if (proc.get(current.process) && 
		proc.getValue('active') == true &&
		numVerifications < proc.getValue('min_verifications')) {	

		gs.addErrorMessage(gs.getMessage("You must configure at least as many verifications as are specified in 'Minimum verifications'"));
		gs.addInfoMessage(gs.getMessage('Process deactivated: {0}', [proc.getValue('name')]));
		proc.setValue('active', false);
		proc.update();

	}	
}
