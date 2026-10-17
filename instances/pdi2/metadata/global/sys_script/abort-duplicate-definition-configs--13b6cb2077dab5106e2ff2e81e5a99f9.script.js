(function executeRule(current, previous /*null when async*/) {

if (current.definition && current.capability) {

        var definitionConfigGr = new GlideRecord('sys_one_extend_definition_config');
        definitionConfigGr.addQuery('definition', current.definition);
		definitionConfigGr.addQuery('capability', current.capability);
        definitionConfigGr.query();

        // If a record with the same definition + capability combination  already exists, abort the insert
        if (definitionConfigGr.hasNext()) {
            gs.addErrorMessage(gs.getMessage("Duplicate inserts are not allowed."));
            current.setAbortAction(true); 
        }
	}

})(current, previous);
