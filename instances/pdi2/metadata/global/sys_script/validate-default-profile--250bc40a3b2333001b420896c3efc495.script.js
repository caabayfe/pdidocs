(function executeRule(current, previous /*null when async*/) {

	var cloneProfileGr = new GlideRecord('clone_profile');
	cloneProfileGr.addQuery('default_profile', true);
	cloneProfileGr.addQuery('sys_id', '!=', current.getValue('sys_id'));
	cloneProfileGr.query();
	
	while(cloneProfileGr.next()) {
		cloneProfileGr.setValue('default_profile', false);
		cloneProfileGr.setWorkflow(false);
		cloneProfileGr.update();
	}

})(current, previous);
