function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (g_form.getValue('sub_automation_plan') == ''){
        g_form.setSectionDisplay("automation_flowinputs", false);
		g_form.setSectionDisplay("guidance_outputs", false);
	}
    else{
        g_form.setSectionDisplay("automation_flowinputs", true);
		g_form.setSectionDisplay("guidance_outputs", true);
	}

}
