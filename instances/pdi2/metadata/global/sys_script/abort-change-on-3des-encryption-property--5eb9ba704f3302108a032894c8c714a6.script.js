(function executeRule(current, previous /*null when async*/) {
	if((previous.name == "glide.security.3des.encryption.allow" && previous.value == "false")) {
		gs.addInfoMessage(gs.getMessage("Restricted an attempt to delete/set non-recommended value for {0} which removes the usage of 3DES.", previous.name));
		gs.log("Info: Restricted an attempt to delete/set non-recommended value for " + previous.name + " which removes the usage of 3DES.");
		current.setAbortAction(true);
	}
})(current, previous);
