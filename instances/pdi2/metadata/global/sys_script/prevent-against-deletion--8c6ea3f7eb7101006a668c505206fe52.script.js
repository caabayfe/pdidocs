// if the verification is part of an active process
// abort deletion.

preventDeletion();

function preventDeletion() {
	var procGr = new GlideRecord('pwd_process');
	// process is active
	procGr.addActiveQuery();
	// and there is mapping to this verification
	var qc = procGr.addJoinQuery('pwd_map_proc_to_verification', 'sys_id', 'process');
	qc.addCondition('verification', current.sys_id);
	procGr.query();
	if (procGr.next()) {
		var procName =  procGr.getValue('name');
		gs.addErrorMessage(gs.getMessage("Cannot delete the verification because it is part of an active process: {0}", [procName]));
		current.setAbortAction(true);
	}	
}
