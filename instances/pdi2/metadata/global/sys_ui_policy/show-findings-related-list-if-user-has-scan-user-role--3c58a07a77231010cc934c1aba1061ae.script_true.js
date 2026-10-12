function onCondition() {
	if (g_user.hasRole("scan_user"))
		g_form.showRelatedList("scan_finding.task");
	else
		g_form.hideRelatedList("scan_finding.task");
}
