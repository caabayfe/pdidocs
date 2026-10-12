function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (isLoading || newValue == '' || !g_form.getControl('location'))
		return;

	g_form.getReference('stockroom', setLocation);
}

function setLocation(stockroom) {
	if (stockroom)
		g_form.setValue('location', stockroom.location);
}
