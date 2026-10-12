function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (isLoading)
		 return;

	// clear fields if property is empty; populate from corresponding sys_properties otherwise
	if (newValue == '') {
		g_form.clearValue('name');
		g_form.clearValue('description');
		g_form.clearValue('default_value');
		g_form.clearValue('type');
	} else if (newValue != '') {
		var prop = new GlideRecord('sys_properties');
		prop.get(newValue);
		g_form.setValue('name', prop.name);
		g_form.setValue('description', prop.description);
		g_form.setValue('default_value', prop.value);
		g_form.setValue('type', prop.type);
	}
   
}
