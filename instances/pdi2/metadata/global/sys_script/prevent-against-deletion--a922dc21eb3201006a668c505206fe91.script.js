// if this identification type is part of an active process
// abort deletion.

preventDeletion();

function preventDeletion() {
	var procGr = new GlideRecord('pwd_process');
	// process is active
	procGr.addActiveQuery();
	procGr.addQuery('identification_type', current.sys_id);
	procGr.query();
	if (procGr.next()) {
		var procName =  procGr.getValue('name');
		gs.addErrorMessage(gs.getMessage("Cannot delete the identification type because it is part of an active process: {0}", [procName]));
		current.setAbortAction(true);
	}	
}
