var gr = new AppRegistrationUtils().getRedirectionGlideRecord('sys_sg_native_client', current.sys_id);
if (gr.next()) {
	action.setRedirectURL(gr);
} else {
	gs.addErrorMessage('Unable to view Mobile Analytics Settings for this entry');
}
	
