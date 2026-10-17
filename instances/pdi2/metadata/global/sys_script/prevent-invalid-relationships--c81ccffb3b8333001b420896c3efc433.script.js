(function executeRule(current, previous /*null when async*/) { 
	var profileCleanupScriptGr = new GlideRecord('clone_profile_cleanup_scripts'); 
	profileCleanupScriptGr.addQuery('profile', current.getValue('profile')); 
	profileCleanupScriptGr.addQuery('cleanup_script', current.getValue('cleanup_script')); 
	profileCleanupScriptGr.query(); 
	
	if(profileCleanupScriptGr.next()) { 
		gs.addErrorMessage('Profile ' + current.profile.name + ' is already linked to the cleanup script ' + current.cleanup_script.getDisplayValue()); current.setAbortAction(true); 
	} 
})(current, previous);
