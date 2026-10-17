// if this credential store is part of an active process
// abort deletion.

preventDeletion();

function preventDeletion() {
	var procGr = new GlideRecord('pwd_process');
	// process is active
	procGr.addActiveQuery();
	// and there is mapping to this credential store
	var qc = procGr.addJoinQuery('pwd_map_proc_to_cred_store', 'sys_id', 'process');
	qc.addCondition('cred_store', current.sys_id);
	procGr.query();
	if (procGr.next()) {
		var procName =  procGr.getValue('name');
		gs.addErrorMessage(gs.getMessage("Cannot delete the credential store because it is part of an active process: {0}", [procName]));
		current.setAbortAction(true);
	}	
}
