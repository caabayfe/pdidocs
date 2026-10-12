(function executeRule(current, previous /*null when async*/) {

	// Add your code here

	if (current.builder && current.definition) {

        var builderCapabilityGr = new GlideRecord('sys_one_extend_builder_capability');
        builderCapabilityGr.addQuery('definition', current.definition);
		builderCapabilityGr.addQuery('builder', current.builder);
        builderCapabilityGr.query();

        // If a record with the same builder + definition combination already exists, abort the insert.
        if (builderCapabilityGr.hasNext()) {
            gs.addErrorMessage(gs.getMessage("Duplicate inserts are not allowed."));
            current.setAbortAction(true); 
        }
	}


})(current, previous);
