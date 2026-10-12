(function executeRule(current, previous /*null when async*/) {
	if (GlideDomainSupport.isDataSeparationEnabled() &&
		current.getElement("configuration_item.sys_domain") != 'global' &&
		current.getElement("group.sys_domain") != 'global' &&
		!JSON.stringify(GlideDomainSupport.getHierarchy(current.getElement("group.sys_domain"))).contains(current.getElement("configuration_item.sys_domain"))
		) {
		gs.addErrorMessage(gs.getMessage("Can't add the CI {0} to this CMDB Group because of domain mismatch.", current.getElement("configuration_item.name")));
		current.setAbortAction(true);
	}
})(current, previous);
