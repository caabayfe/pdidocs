(function executeRule(current, previous /*null when async*/) {
	var layoutBoundRec = new GlideRecord("sys_ux_layout_bounds");
	layoutBoundRec.addQuery("macroponent", current.macroponent);
	layoutBoundRec.query();
	if (layoutBoundRec.hasNext()) {
		gs.addErrorMessage(gs.getMessage("Duplicate Record Found"));
		current.setAbortAction(true);
		return;
	}
})(current, previous);
