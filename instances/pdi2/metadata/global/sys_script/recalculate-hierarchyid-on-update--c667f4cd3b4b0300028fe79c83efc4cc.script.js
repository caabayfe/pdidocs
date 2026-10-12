(function executeRule(current, previous /*null when async*/) {
	var capManageHIerarchy = new CapabilityManageHierachy();
    gs.info("HI! calling BR on update for script "+capManageHIerarchy);	capManageHIerarchy.processUpdateCapability(previous.getValue('parent'),current.getValue('parent'),current.getUniqueValue());
})(current, previous);
