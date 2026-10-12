(function executeRule(current, previous /*null when async*/) { 
	
	var clonePreserverGr = new GlideRecord('clone_profile_preservers'); 
	clonePreserverGr.addQuery('profile', current.getValue('profile'));
	clonePreserverGr.addQuery('preserver', current.getValue('preserver')); 
	clonePreserverGr.query();
	
	if(clonePreserverGr.next()) { 
		gs.addErrorMessage('Profile ' + current.profile.getDisplayValue() + ' is already linked to preserver ' + current.preserver.getDisplayValue()); 
		current.setAbortAction(true); 
	} 
})(current, previous);
