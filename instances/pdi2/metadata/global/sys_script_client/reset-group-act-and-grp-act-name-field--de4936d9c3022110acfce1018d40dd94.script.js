function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === '') {
        return;
    }
    g_form.setValue("field", "");
    if (g_form.getValue("type") == "DEFAULT") {
        g_form.setValue("track_change", false);
		g_form.setVisible("display_name", true);
		g_form.clearValue("display_name"); 
    } else {
		g_form.setValue("track_change", true);
		g_form.setMandatory("display_name", false);
		g_form.setVisible("display_name", false);
		// dont override the group activity name to empty for parent attached as it populates the parent's name by default
		if(g_form.getValue("type") != "PARENT_ATTACHED") {
			g_form.setValue("change_name", "");
		}		
	}
}
