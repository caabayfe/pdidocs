function onLoad() {
	var breakdown_count = g_form.getIntValue('related_breakdowns');
	g_form.setSectionDisplay('collect_breakdownmatrix', (breakdown_count > 0)); 
}
