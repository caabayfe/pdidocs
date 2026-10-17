doInsertAndStay();
function doInsertAndStay() {
    
	var sourceProfile = String(current.sys_id);
	
	var cloneProfileGr = new GlideRecord('clone_profile');
	cloneProfileGr.addQuery('name', current.name);
	cloneProfileGr.query();
	
	if(cloneProfileGr.next()) {
		gs.addErrorMessage('Profile ' + current.name + ' already exists. Please change the profile name before using Insert and Stay.');
		action.setRedirectURL(current);
		return;
	}
	
	var saveMe = current;
	current.default_profile = false;
	current.setWorkflow(false);
    var targetProfile = current.insert();
	
	CloneProfileUtil.duplicateProfile(sourceProfile, targetProfile);
	
	gs.addInfoMessage('Profile duplicated successfully.');
    action.setRedirectURL(saveMe);
}

function copyDataPreservers(sourceProfile, targetProfile) {
	var tgtProfilePreserverGr;
	
	var srcProfilePreserverGr = new GlideRecord('clone_profile_preservers');
	srcProfilePreserverGr.addQuery('profile', sourceProfile);
	srcProfilePreserverGr.query();
	
	while(srcProfilePreserverGr.next()) {
		tgtProfilePreserverGr = new GlideRecord('clone_profile_preservers');
		tgtProfilePreserverGr.initialize();
		
		tgtProfilePreserverGr.profile = targetProfile;
		tgtProfilePreserverGr.preserver = String(srcProfilePreserverGr.preserver);
		tgtProfilePreserverGr.insert();
	}
}

function copyTableExclusions(sourceProfile, targetProfile) {
	var tgtProfileExclusionGr;
	
	var srcProfileExclusionGr = new GlideRecord('clone_profile_exclusions');
	srcProfileExclusionGr.addQuery('profile', sourceProfile);
	srcProfileExclusionGr.query();
	
	while(srcProfileExclusionGr.next()) {
		tgtProfileExclusionGr = new GlideRecord('clone_profile_exclusions');
		tgtProfileExclusionGr.initialize();
		
		tgtProfileExclusionGr.profile = targetProfile;
		tgtProfileExclusionGr.exclusion = String(srcProfileExclusionGr.exclusion);
		tgtProfileExclusionGr.insert();
	}
}
