function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (newValue == '') {
        deactivate();
        return;
    }
    var taxonomyActive = g_form.getReference('taxonomy').active;
    if (taxonomyActive == 'false') {
        deactivate();
        return;
    }
	if (!isLoading)
		g_form.setValue("active", true);
    g_form.setDisabled("active", false);
    return;
}

function deactivate() {
    g_form.setValue("active", false);
    g_form.setDisabled("active", true);
}
