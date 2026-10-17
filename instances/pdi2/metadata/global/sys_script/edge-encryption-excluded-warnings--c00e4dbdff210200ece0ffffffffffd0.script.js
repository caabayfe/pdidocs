(function executeRule(current, previous) {
	var EXCLUDE_ATTRIBUTE = 'edge_encryption_excluded';   // should be a const (new in ES6) instead of var
	
	// evaluate to strings 'true' or 'false' if attribute is present, null otherwise
	var previouslyEnabledObj = new GlideAttributes(previous.attributes + '').getAttribute(EXCLUDE_ATTRIBUTE);
	var currentlyEnabledObj = new GlideAttributes(current.attributes + '').getAttribute(EXCLUDE_ATTRIBUTE);
	
	var previouslyEnabled = gs.nil(previouslyEnabledObj) ? false : previouslyEnabledObj.toString() == 'true';
	var currentlyEnabled = gs.nil(currentlyEnabledObj) ? false : currentlyEnabledObj.toString() == 'true';
	
	// attribute is being unset
	if (previouslyEnabled && !currentlyEnabled) {
		var isActive = new GlidePluginManager().isActive('com.glide.edgeencryption');
		
		if (isActive)
			gs.addInfoMessage(gs.getMessage('Choosing to encrypt this field may cause errors. ' +
											'Please look up the field using the DevStudio search tool.'));
		else {
			gs.addErrorMessage(gs.getMessage('Removal of attribute ' + EXCLUDE_ATTRIBUTE + ' is irrelevant. ' +
											 'Action not applied.'));
			current.setAbortAction(true);
		}
	} else if (currentlyEnabled && !previouslyEnabled) {
    //No check on active flag because an encryption configuration, once created can be re-enabled at any time.
		var gr = new GlideRecord('sys_encryption_configuration');
		if (gr.isValid()) {
            gr.addQuery('table', current.name);
            gr.addQuery('type', 'Column');
            if (current.internal_type != 'collection')
                gr.addQuery('column', current.element);
            gr.query();
            if (gr.hasNext()) {
                gs.addErrorMessage(gs.getMessage('Addition of attribute ' + EXCLUDE_ATTRIBUTE + ' conflicts ' +
                                                 'with a preexisting encryption configuration. Action prevented.'));
                current.setAbortAction(true);
            }
        }
	}
})(current, previous);
