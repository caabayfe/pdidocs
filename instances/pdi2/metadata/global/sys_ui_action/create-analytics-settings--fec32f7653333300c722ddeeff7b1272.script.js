sn_mobile_analytics.MobileAnalytics.createSettingsForNativeClient(current.sys_id, current.type);
var gr = new AppRegistrationUtils().getRedirectionGlideRecord('sys_sg_native_client', current.sys_id);
if (gr.next()) {
	action.setRedirectURL(gr);
} else {
	gs.addErrorMessage('Unable to create Mobile Analytics Settings for this entry');
}
	
