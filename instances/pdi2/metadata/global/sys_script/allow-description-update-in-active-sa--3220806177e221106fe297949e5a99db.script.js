(function executeRule(current, previous /*null when async*/) {
	
	// don't allow renaming the attribute if it's used by another one:
	if (current['name'] != previous['name']) {
		var usedBySysIDs = _getUsedByOthersSysIDs();
		if (usedBySysIDs != '') {
			var msg = gs.getMessage("Renaming is not allowed because the attribute is used by other attributes with IDs: {0}", [usedBySysIDs]);
			gs.addErrorMessage(msg);
			current.setAbortAction(true);
			return;
		}
	}

    // if trying to rename, check if security attribute is active or in use unless it's localized
    if (current.operation() === 'update' && current.active == true && current.is_localized == false) {
   
        // allow only description change
		var onlyDescription = true;
		for (var fieldName in current) {

			// skip fields inherited from sys_metadata
			if (fieldName.startsWith('sys_'))
				continue;

			if (fieldName !== 'description' && current[fieldName] != previous[fieldName] && fieldName !== 'active') {
				onlyDescription = false;
				break;
			}
		}
        
        if (!onlyDescription) { 
            var msg = gs.getMessage("Only description change is allowed in active Security Attribute");
            gs.addErrorMessage(msg);
            current.setAbortAction(true);
            return;         
        }
	}

	function _getUsedByOthersSysIDs() {
		var usedBySysIDs = '';
		var gr = new GlideRecord('v_security_attribute_audit');
		gr.addQuery('security_attribute', current.sys_id);
		gr.addQuery('table_name', 'sys_security_attribute');
		gr.query();
		while (gr.next()) {
			usedBySysIDs += gr.referenced_by;
			if (gr.hasNext())
				usedBySysIDs +=  ', ';
		} 

		return usedBySysIDs;
	}

})(current, previous);
