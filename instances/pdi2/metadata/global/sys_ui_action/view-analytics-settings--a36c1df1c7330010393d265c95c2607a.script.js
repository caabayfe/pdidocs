var gr = new AppRegistrationUtils().getRedirectionGlideRecord('sp_portal', current.sys_id);
if (gr.next()) {
	action.setRedirectURL(gr);
} else {
	gs.addErrorMessage(gs.getMessage('Unable to view Analytics Settings for this entry'));
}
