(function executeRule(current, previous /*null when async*/) { 

	var currentProfileName = current.getValue('name');
	var cloneProfileGr = new GlideRecord('clone_profile'); 
	cloneProfileGr.addQuery('name', currentProfileName);

	if(current.operation() == 'update')
		cloneProfileGr.addQuery('sys_id', '!=', current.getValue('sys_id'));

	cloneProfileGr.query();
	if(cloneProfileGr.next()) {
		gs.addErrorMessage("Profile " + currentProfileName + " already exists.");
		current.setAbortAction(true);
	}
})(current, previous);
