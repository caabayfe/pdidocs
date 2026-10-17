(function executeRule(current, previous /*null when async*/) {
	var screenAttrRec = new GlideRecord("sys_ux_screen_attrs");
	screenAttrRec.addQuery("screen", current.screen);
	screenAttrRec.query();
	if (screenAttrRec.hasNext()) {
		gs.addErrorMessage(gs.getMessage("Duplicate Record Found"));
		current.setAbortAction(true);
		return;
	}
})(current, previous);
