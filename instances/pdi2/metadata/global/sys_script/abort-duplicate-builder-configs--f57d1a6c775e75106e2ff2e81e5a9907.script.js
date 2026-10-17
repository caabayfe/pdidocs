(function executeRule(current, previous /*null when async*/) {

	// Add your code here
	if (current.name) {

        var builderConfigGr = new GlideRecord('sys_one_extend_builder_config');
        builderConfigGr.addQuery('name', current.name);
        builderConfigGr.query();

        // If a record with the same name already exists, abort the insert
        if (builderConfigGr.hasNext()) {
            gs.addErrorMessage(gs.getMessage("Duplicate inserts are not allowed."));
            current.setAbortAction(true); 
        }
	}

})(current, previous);
