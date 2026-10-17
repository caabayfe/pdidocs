function onLoad() {
    var displayable = (g_scratchpad.managedSources == 'true');
	g_form.setDisplay('managed_breakdown', displayable);
	g_form.setDisplay('managed_publisher', displayable);
}
