function getPortalURL() {
	var ga = new GlideAjax('CABMeetingAjax');
	ga.addParam('sysparm_name','getPortalURL');
	ga.addParam('sysparm_meeting', g_form.getUniqueValue());
	ga.getXMLAnswer(gotoPortalURL);
}

function gotoPortalURL(portalURL) {
	if (portalURL)
		g_navigation.open(portalURL, "_blank");
	else {
		if (gs.getProperty('sn_change_cab.com.snc.change_management.cab.use_sow_meeting', false) + "" == "true")
			g_form.addErrorMessage(new GwtMessage().getMessage("Failed to generate the Service Operations Workspace URL for this meeting"));
		else
			g_form.addErrorMessage(new GwtMessage().getMessage("Failed to generate the service portal URL for this meeting"));
	}
}
