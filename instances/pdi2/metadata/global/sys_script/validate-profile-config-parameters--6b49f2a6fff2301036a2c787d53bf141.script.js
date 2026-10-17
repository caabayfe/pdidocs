(function executeRule(current, previous /*null when async*/) {

	// Execute this on insert or on update when the name or profile changes only
	if (current.operation() == "update" && !(current.name.changes() || current.profile.changes()))
		return;
	
	var IGNORED_PARAMS = ["mid.buildstamp", "mid_sys_id", "keypairs.mid_id", "home_dir", "mid_profile_id"];
	
	if (IGNORED_PARAMS.indexOf(current.name + '') != -1) {
		gs.addErrorMessage(gs.getMessage("Parameter: {0} is used by the system and cannot be added to profile.", current.name));
		current.setAbortAction(true);
		return;
	}

	// Ensure that parameter value is not hidden. Hidden parameter should go in the secrets file instead.
	var mcu = SncMIDConfigParameter.byName(current.name);
	if (mcu.isHidden()) {
		gs.addErrorMessage(gs.getMessage("Parameter: {0} contains a sensitive value and should go in secrets file.", current.name));
		current.setAbortAction(true);
		return;
	}

	// Ensure parameter doesn't already exist on the profile
	var configGr = new GlideRecord("mid_profile_config");
	configGr.addQuery("profile", current.profile);
	configGr.addQuery("name", current.name);
	configGr.query();
	if (configGr.hasNext()) {
		gs.addErrorMessage(gs.getMessage("Parameter: {0} already exists for this profile", current.name));
		current.setAbortAction(true);
	}
	

})(current, previous);
