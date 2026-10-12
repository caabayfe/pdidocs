(function executeRule(current, previous /*null when async*/) {

	if (current.name) {

        var capabilityDefinitionGr = new GlideRecord('sys_one_extend_capability_definition');
        capabilityDefinitionGr.addQuery('name', current.name);
        capabilityDefinitionGr.query();

        // If a record with the same name already exists, abort the insert
        if (capabilityDefinitionGr.hasNext()) {
            gs.addErrorMessage(gs.getMessage("Duplicate inserts are not allowed."));
            current.setAbortAction(true); 
        }
	}

})(current, previous);
