function onLoad() {
	var listname = 'pa_indicators';
	if (g_form.getBooleanValue('has_managed_indicators')) { 
		g_form.showRelatedList(listname);
		g_form.showFieldMsg('name', getMessage('This is a managing indicator.'), 'info');
	} else {
		g_form.hideRelatedList(listname);
		if (g_form.getValue('managing_indicator'))
			g_form.showFieldMsg('name', getMessage('This is a managed indicator.'), 'warning');
	}
}
