action.setRedirectURL(current);
if (current.isNewRecord()) {
	if (current.canCreate()) {
		current.insert();
	}
} else {
	if (current.canWrite()) {
		current.update();
	}
}

if (current.sys_id) {
	gs.setProperty('glide.ui.m.mobile_theme', current.sys_id);
	gs.addInfoMessage(gs.getMessage('The theme has been activated. You may need to log out and log back in to see the updated theme.'));
} else {
	gs.addErrorMessage(gs.getMessage('Failed to activate theme.'));
}
