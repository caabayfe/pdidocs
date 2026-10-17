function onChange(control, oldValue, newValue) {			
    if (oldValue == newValue)
        return;
			
    g_form.setMandatory('short_description', true);

}
