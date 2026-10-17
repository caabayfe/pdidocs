(function executeRule(current, previous /*null when async*/) { 
	
	var cloneExclusionGr = new GlideRecord('clone_profile_exclusions'); 
	cloneExclusionGr.addQuery('profile', current.getValue('profile')); 
	cloneExclusionGr.addQuery('exclusion', current.getValue('exclusion')); 
	cloneExclusionGr.query();
	
	if(cloneExclusionGr.next()) { 
		gs.addErrorMessage('Profile ' + current.profile.getDisplayValue() + ' is already linked to exclusion ' + current.exclusion.getDisplayValue()); 
		current.setAbortAction(true); 
	} 
})(current, previous);
