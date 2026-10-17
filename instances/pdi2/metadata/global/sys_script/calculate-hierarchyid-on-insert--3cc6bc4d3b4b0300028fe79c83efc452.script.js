(function executeRule(current, previous /*null when async*/) {
	var capManageHierarchy = new CapabilityManageHierachy();
	capManageHierarchy.processAddCapability(current.getValue('parent'),current.getUniqueValue());
})(current, previous);
