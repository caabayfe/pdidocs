function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading) {
		if (g_form.getValue("not_show_intro_note") == "true") 
			g_form.setDisplay("introduction", false);
        return;
	}
	
	if (newValue == "true")
		g_form.setDisplay("introduction", false);
	else
		g_form.setDisplay("introduction", true);
}
