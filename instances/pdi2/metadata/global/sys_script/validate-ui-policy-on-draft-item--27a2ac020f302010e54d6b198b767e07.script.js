(function executeRule(current, previous /*null when async*/) {
	
	if (JSUtil.notNil(current.sys_overrides)) {
		gs.addErrorMessage(gs.getMessage('You cannot override a record associated with this item'));
		current.setAbortAction(true);
		return;
	}
	if (JSUtil.nil(current.sys_domain) || JSUtil.nil(current.catalog_item) || JSUtil.nil(current.catalog_item.sys_domain))
		return;
	
	var itemDomain = current.catalog_item.sys_domain;
	var recordDomain = current.sys_domain;
	if (!itemDomain.equals(recordDomain)) {
		gs.addErrorMessage(gs.getMessage('This record cannot be associated with this item as it\'s domain is not the same as the item\'s domain.'));
			current.setAbortAction(true);
			return;
	}
})(current, previous);
