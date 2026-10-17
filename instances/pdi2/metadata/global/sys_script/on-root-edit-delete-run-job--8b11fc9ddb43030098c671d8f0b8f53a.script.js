(function executeRule(current, previous /*null when async*/) {
	if ((current.getValue('hierarchy_id') && (current.getValue('hierarchy_id')).startsWith('CBP_UI')) || 
		(previous && previous.getValue('hierarchy_id') && (previous.getValue('hierarchy_id')).startsWith('CBP_UI')))
		return;

	// Check for APM plugin	
        if (!GlidePluginManager.isActive('com.snc.apm')) {
	    return;
	}

	var msgArray = [];  
	var job = "Update Business Capability Levels and Hierarchy IDs";
	msgArray.push(job);  
	var msg = gs.getMessage("A level-0 capability has been added/deleted. Please run the {0} job to recalculate the new hierarchy ids", msgArray);
	gs.addInfoMessage(msg);

})(current, previous);
