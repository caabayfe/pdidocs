try {
	var clonedEl = UxPageTreeCloner.clonePageElement(current.sys_id);
	gs.addInfoMessage(gs.getMessage('Page cloned successfully.'));
	action.setRedirectURL(clonedEl);
}
catch(e) {
	gs.log('[UXBuilder] UI Action - Clone Page: Failed to clone page element. Exception = ' + e.getMessage());
	gs.addErrorMessage(gs.getMessage('Failed to completely clone the page element tree. There may be residual records from this attempt.'));
}
