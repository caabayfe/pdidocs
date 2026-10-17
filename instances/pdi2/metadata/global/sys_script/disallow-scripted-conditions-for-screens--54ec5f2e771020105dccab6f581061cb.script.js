(function executeRule(current, previous /*null when async*/) {
	var grRoute = new GlideRecord("sys_ux_app_route");
	var grScreen = grRoute.addJoinQuery("sys_ux_screen", "screen_type", "screen_type");
	grScreen.addCondition("sys_id", current.screen);
	grRoute.query();
	
	var isViewportRecord = false;
	while (grRoute.next()) {
		// check if it is screen record or viewport record
		if (grRoute.parent_macroponent_composition_element_id || grRoute.extension_point) {
			isViewportRecord = true;
		}
	}
	
	if (!isViewportRecord){
		gs.addErrorMessage(gs.getMessage("Scripted conditions are supported only for viewports and not for top level screen variants"));
		current.setAbortAction(true);
	}
})(current, previous);
