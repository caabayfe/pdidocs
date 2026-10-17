(function executeRule(current, previous /*null when async*/) {

	var portalId = current.getValue("sys_id"),
			themeId = current.getValue("theme"),
			homePageId = current.getValue("homepage"),
			urlSuffix = current.getValue("url_suffix");

	var isEMPortal = (themeId == "f2c5a93d53ae5010be19ddeeff7b125c") // CWF Engagement Messenger Theme
			&& (homePageId == "2a762d3d53ae5010be19ddeeff7b1272") // cwf_em_home
			&& ((/[0-9a-f]{32}/).test(urlSuffix)); //check if url suffix is 32bit sys_id
	try {
		if (sn_app_analytics.SNAnalytics.isEnabled() && !isEMPortal) {
			sn_sp_analytics.SPAnalytics.createSettingsForPortal(portalId, "service_portal");
			gs.info("Usage Insights Setting created for the portal with sys_id = " + portalId);
		} else {
			gs.info("Unable to create Analytics Settings for the portal with sys_id = " + portalId);
		}
	} catch (err) {
		gs.error("Unexpected error occurred while creating Usage Insights Setting. Error message: " + err.message);
	}
})(current, previous);
