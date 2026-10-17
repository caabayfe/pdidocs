try {
	UXFMigrationUtils.migrateNYLandingPage(current.sys_id);
	gs.addInfoMessage(gs.getMessage('Landing page is now enabled for UI Builder.'));
}
catch(e) {
	gs.warn('[UXFramework] UI Action - Make UIB Compatible: Failed to migrate landing page. Exception = ' + e.getMessage());
	gs.addErrorMessage(gs.getMessage('Failed to enable landing page for UI Builder. {0}', e.getMessage()));
}
action.setRedirectURL(current);
