(function executeRule(current, previous /*null when async*/) {
	if ((current.getValue('hierarchy_id') && (current.getValue('hierarchy_id')).startsWith('CBP_UI')) || (previous.getValue('hierarchy_id') && (previous.getValue('hierarchy_id')).startsWith('CBP_UI')))
		return;	

        // Check for APM plugin
        if (!GlidePluginManager.isActive('com.snc.apm')) {
            return;
        }
	
        var msgArray = [];  
	msgArray.push("Update Business Capability Levels and Hierarchy IDs");  
	var msg = gs.getMessage("A level-0 capability has been updated. Please run the {0} job to recalculate the new hierarchy ids", msgArray);
	gs.addInfoMessage(msg);
})(current, previous);
