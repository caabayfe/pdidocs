try {
	var errMsg = 'Unable to create Analytics Settings for this entry';
	sn_sp_analytics.SPAnalytics.createSettingsForPortal(current.sys_id, 'service_portal');
	if (sn_sp_analytics.SPAnalytics.settingsExistForPortal(current.sys_id)) {
		var gr = new AppRegistrationUtils().getRedirectionGlideRecord('sp_portal', current.sys_id);
		if (gr.next())
			action.setRedirectURL(gr);
	} else {
		gs.addErrorMessage(errMsg);
	}
} catch (err) {
	gs.addErrorMessage(errMsg);
}
