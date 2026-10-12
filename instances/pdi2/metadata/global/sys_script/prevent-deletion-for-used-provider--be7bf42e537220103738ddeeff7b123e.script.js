(function executeRule(current, previous /*null when async*/) {
	var existingScreen = new GlideRecord("sys_sg_custom_map_screen");
	existingScreen.addEncodedQuery("default_provider=" + current.getUniqueValue() + "^ORprovidersLIKE" + current.getUniqueValue());
	existingScreen.setLimit(1);
	existingScreen.query();
	
	if(!existingScreen.next())
		return;
	
	current.setAbortAction(true);
	gs.addErrorMessage(gs.getMessage("Cannot delete a custom map provider that is being used by a screen."));
})(current, previous);
