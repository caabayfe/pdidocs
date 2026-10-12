(function executeRule(current, previous /*null when async*/) {
	var grSecCardInstance = new GlideRecord("sys_sg_section_card_instance");
	grSecCardInstance.addQuery("section", current.section);
	if (current.operation() == "update")
		grSecCardInstance.addQuery("sys_id", "!=", current.sys_id);
		
	grSecCardInstance.query();
	if (grSecCardInstance.getRowCount() > 0) {
		current.setAbortAction(true);
		gs.addErrorMessage(gs.getMessage("Only one section card instance can be added to a section."));
	}
})(current, previous);
