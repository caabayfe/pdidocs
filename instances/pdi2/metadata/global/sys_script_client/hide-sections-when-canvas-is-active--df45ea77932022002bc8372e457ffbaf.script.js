function onLoad() {
	if (g_scratchpad.isCanvasActive === 'true') {
		g_form.setSectionDisplay('access_control', false);
		g_form.setDisplay('no_tabs', false);
		g_form.setDisplay('restrict_to_roles', true);
		if (g_scratchpad.isNewSharingActive === 'false')
			g_form.showRelatedList('pa_dashboards_permissions');
		else
			g_form.hideRelatedList('pa_dashboards_permissions');
	}  else {
			g_form.setDisplay('restrict_to_roles', false);
			g_form.hideRelatedList('pa_dashboards_permissions');
	}
}
