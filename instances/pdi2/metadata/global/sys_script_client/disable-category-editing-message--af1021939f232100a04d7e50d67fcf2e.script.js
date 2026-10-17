function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (isLoading) {
		return;
	}
	
	if (newValue == "true")
		g_form.showFieldMsg('disable_category_editing',getMessage('This will disable editing and adding categories from the category picker'),'info');
	else
		g_form.hideFieldMsg('disable_category_editing');
}
