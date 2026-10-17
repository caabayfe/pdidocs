(function executeRule(current, previous /*null when async*/) {

	if((previous.name == "glide.password2.legacycode.disabled" && previous.value == "true") || (previous.name == "glide.password2.honor.attributes" && previous.value == "false")) {
		gs.addInfoMessage(gs.getMessage("Restricted an attempt to delete/set non-recommended value for {0} which removes the usage of 3DES in Password2 fields.", previous.name));
		gs.log("Info: Restricted an attempt to delete/set non-recommended value for " + previous.name + " which removes the usage of 3DES in Password2 fields.");
		current.setAbortAction(true);
	}

})(current, previous);
